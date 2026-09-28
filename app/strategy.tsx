import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { getActiveGoal, getProfile, type StoredGoal } from '../src/data/repositories/profile';
import { useDatabase } from '../src/data/useDatabase';
import { Screen } from '../src/components/Screen';
import { Copy } from '../src/components/Copy';
import { Button } from '../src/components/Button';
import { PlanPreview } from '../src/features/onboarding/PlanPreview';

export default function Strategy() {
  const db=useDatabase();const [goal,setGoal]=useState<StoredGoal|null>(null);const [error,setError]=useState('');
  const [units,setUnits]=useState<'metric'|'imperial'>('metric');
  useFocusEffect(useCallback(()=>{let active=true;Promise.all([getActiveGoal(db),getProfile(db)]).then(([g,p])=>{if(active){setGoal(g);setUnits(p?.units??'metric');}}).catch((e:Error)=>{if(active)setError(e.message);});return()=>{active=false;};},[db]));
  return <Screen eyebrow="YOUR PLAN" title="A direction, not a verdict.">
    {goal?<><Copy>{goal.input.mode.toUpperCase()} · plan effective {goal.effectiveFrom}</Copy><PlanPreview plan={goal.plan} units={units}/><Button label="Edit my goal" onPress={()=>router.push('/goal')}/></>:<Copy muted>Opening your plan…</Copy>}
    <Copy muted>This first test release uses an initial estimate. Adaptive expenditure, trend charts and weekly reviews are part of the next development milestones.</Copy>
    {error?<Copy error>{error}</Copy>:null}<Button label="Back to Home" secondary onPress={()=>router.replace('/')}/>
  </Screen>;
}
