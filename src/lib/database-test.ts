import { supabase } from './supabase'

export const testDatabaseSchema = async () => {
  const results = {
    tablesExist: false,
    sessionCreation: false,
    dailyEntryCreation: false,
    weeklyEntryCreation: false,
    goalsConfigCreation: false,
    rlsWorking: false,
    error: null as string | null
  }

  try {
    // Test 1: Check if tables exist by trying to select from them
    console.log('Testing table existence...')
    
    const { error: sessionError } = await supabase.from('sessions').select('*').limit(0)
    const { error: dailyError } = await supabase.from('daily_entries').select('*').limit(0)
    const { error: weeklyError } = await supabase.from('weekly_entries').select('*').limit(0)
    const { error: goalsError } = await supabase.from('goals_config').select('*').limit(0)

    if (!sessionError && !dailyError && !weeklyError && !goalsError) {
      results.tablesExist = true
      console.log('✅ All tables exist')
    } else {
      console.log('❌ Some tables missing:', { sessionError, dailyError, weeklyError, goalsError })
      results.error = `Tables missing: ${JSON.stringify({ sessionError: sessionError?.message, dailyError: dailyError?.message, weeklyError: weeklyError?.message, goalsError: goalsError?.message })}`
      return results
    }

    // Test 2: Create a session (should work with new policies)
    console.log('Testing session creation...')
    
    const testSessionKey = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    const { data: sessionData, error: sessionCreateError } = await supabase
      .from('sessions')
      .insert([{ session_key: testSessionKey }])
      .select()

    if (sessionCreateError) {
      console.log('❌ Session creation failed:', sessionCreateError)
      results.error = `Session creation failed: ${sessionCreateError.message}`
      return results
    }

    if (sessionData?.length > 0) {
      results.sessionCreation = true
      console.log('✅ Session creation works')
      
      const sessionId = sessionData[0].id

      // Test 3: Set session context for other operations
      console.log('Setting session context...')
      
      const { error: contextError } = await supabase.rpc('set_session_context', {
        session_key: testSessionKey
      })

      if (contextError) {
        console.log('⚠️ Session context setting failed:', contextError)
        results.error = `Session context failed: ${contextError.message}`
        results.rlsWorking = false
      } else {
        console.log('✅ Session context set successfully')
        results.rlsWorking = true

        // Test daily entry creation
        console.log('Testing daily entry creation...')
        const { error: dailyError } = await supabase
          .from('daily_entries')
          .insert([{
            session_id: sessionId,
            date: '2026-01-01',
            pages_read: 10,
            strength_workout: true
          }])

        if (!dailyError) {
          results.dailyEntryCreation = true
          console.log('✅ Daily entry creation works')
        } else {
          console.log('❌ Daily entry creation failed:', dailyError)
          results.error = `Daily entry failed: ${dailyError.message}`
        }

        // Test weekly entry creation
        console.log('Testing weekly entry creation...')
        const { error: weeklyError } = await supabase
          .from('weekly_entries')
          .insert([{
            session_id: sessionId,
            week_start_date: '2026-01-01',
            work_blockers_unlocked: 1
          }])

        if (!weeklyError) {
          results.weeklyEntryCreation = true
          console.log('✅ Weekly entry creation works')
        } else {
          console.log('❌ Weekly entry creation failed:', weeklyError)
          if (!results.error) results.error = `Weekly entry failed: ${weeklyError.message}`
        }

        // Test goals config creation
        console.log('Testing goals config creation...')
        const { error: goalsError } = await supabase
          .from('goals_config')
          .insert([{
            session_id: sessionId,
            month_year: '2026-01',
            strength_workouts_per_week: 3,
            pages_per_day: 10
          }])

        if (!goalsError) {
          results.goalsConfigCreation = true
          console.log('✅ Goals config creation works')
        } else {
          console.log('❌ Goals config creation failed:', goalsError)
          if (!results.error) results.error = `Goals config failed: ${goalsError.message}`
        }
      }

      // Cleanup test data
      console.log('Cleaning up test data...')
      await supabase.from('sessions').delete().eq('session_key', testSessionKey)
      
    } else {
      results.error = 'Session creation returned no data'
    }

  } catch (error) {
    console.error('Database test failed:', error)
    results.error = `Test failed: ${error}`
  }

  return results
}