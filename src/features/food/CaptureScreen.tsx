import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../components/Screen';
import { Copy } from '../../components/Copy';
import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import { ChoiceGroup } from '../../components/ChoiceGroup';
import { DateTimeField } from '../../components/DateTimeField';
import { Surface } from '../../components/Surface';
import { useDatabase } from '../../data/useDatabase';
import { getProfile } from '../../data/repositories/profile';
import { logFood, logWeight, latestWeight, undoFood, type FoodInput, type WeightInput } from '../../data/repositories/journal';
import type { ProfileInput } from '../../domain/planning';
import { weightDraftKg } from '../../domain/draftPresentation';
import { dateFromParam, localDate } from '../../domain/dates';
import { colors } from '../../design/tokens';

export function CaptureScreen() {
  const params = useLocalSearchParams<{kind?:string;date?:string}>(); const db = useDatabase();
  const [kind,setKind] = useState(params.kind === 'weight' ? 'weight' : 'food');
  const [name,setName] = useState(''); const [quantity,setQuantity] = useState('1 serving');
  const [kcal,setKcal] = useState(''); const [protein,setProtein] = useState(''); const [carbs,setCarbs] = useState(''); const [fat,setFat] = useState('');
  const [weight,setWeight] = useState(''); const [date,setDate] = useState(() => dateFromParam(params.date));
  const [units,setUnits] = useState<ProfileInput['units']>('metric'); const [last,setLast] = useState<number | null>(null);
  const [influence,setInfluence] = useState<WeightInput['influence']>('normal');
  const [phase,setPhase] = useState<'edit'|'review'|'saved'>('edit'); const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  const [reviewedAt,setReviewedAt] = useState<number | null>(null);
  const saving = useRef(false); const token = useRef<string | null>(null);
  useEffect(() => { let active = true; Promise.all([getProfile(db),latestWeight(db)]).then(([p,w]) => { if (active) { if(p)setUnits(p.units); setLast(w?.kg ?? p?.weightKg ?? null); } }).catch((e:Error) => { if(active)setError(e.message); }); return () => { active=false; }; },[db]);
  const kg = weightDraftKg(weight,units);
  const unusual = kg !== null && last !== null && Math.abs(kg-last) > Math.max(3,last*0.08);
  const macroEnergy = 4*Number(protein)+4*Number(carbs)+9*Number(fat);
  const differs = kind==='food' && Math.abs(macroEnergy-Number(kcal))>Math.max(20,Number(kcal)*0.2);
  function review() {
    setError('');
    const now = Date.now();
    if (!Number.isFinite(date.getTime())) { setError('Choose a valid date and time.'); return; }
    if(kind==='food') {
      if(!name.trim() || !quantity.trim() || [kcal,protein,carbs,fat].some(v=>!v.trim()||!Number.isFinite(Number(v))||Number(v)<0)) { setError('Add a food name, portion and nonnegative nutrition values. Enter 0 when a nutrient is zero.'); return; }
    } else if(kg===null||kg<20||kg>400||date.getTime()>now) { setError('Enter a valid recorded weight and a time that is not in the future.'); return; }
    setReviewedAt(now);
    setPhase('review');
  }
  async function save() {
    if(saving.current)return; saving.current=true;setBusy(true);setError('');
    try {
      token.current ??= `entry-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const common={id:token.current,occurredAt:date.getTime(),timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone};
      if(kind==='food') { const input:FoodInput={...common,name,quantityLabel:quantity,kcal:Number(kcal),protein:Number(protein),carbs:Number(carbs),fat:Number(fat)}; await logFood(db,input); }
      else { if (kg === null) throw new Error('Enter a valid weight.'); await logWeight(db,{...common,kg,influence}); }
      setPhase('saved'); void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(()=>{});
    } catch(e) {setError((e as Error).message);} finally {saving.current=false;setBusy(false);}
  }
  return <Screen eyebrow="YOUR JOURNAL" title={phase==='saved'?'A little progress.':phase==='review'?'Looks right?':'What would you like to log?'}>
    <View style={styles.form}>
    {phase==='edit'?<>
      <ChoiceGroup label="Capture" value={kind} onChange={setKind} options={[{value:'food',label:'Food'},{value:'weight',label:'Weight'}]} />
      {kind==='food'?<>
        <Copy muted>Quick add a known meal or label. Enter the totals for the whole portion you ate.</Copy>
        <Field label="Food or meal" value={name} onChangeText={setName} />
        <Field label="Portion" value={quantity} onChangeText={setQuantity} help="For example: 250 g, 2 eggs, or 1 bowl." />
        <Field label="Calories" value={kcal} onChangeText={setKcal} keyboardType="decimal-pad" suffix="kcal" />
        <Field label="Protein" value={protein} onChangeText={setProtein} keyboardType="decimal-pad" suffix="g" />
        <Field label="Carbohydrate" value={carbs} onChangeText={setCarbs} keyboardType="decimal-pad" suffix="g" />
        <Field label="Fat" value={fat} onChangeText={setFat} keyboardType="decimal-pad" suffix="g" />
      </>:<><Copy muted>Record the scale reading as it is. One unusual day does not define your progress.</Copy><Field label="Scale weight" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" suffix={units==='metric'?'kg':'lb'} /></>}
      <DateTimeField value={date} onChange={setDate} />
      <Button label="Review entry" onPress={review} />
    </>:null}
    {phase==='review'?<>
      <Surface><Text style={styles.heading}>{kind==='food'?name:`${weight} ${units==='metric'?'kg':'lb'}`}</Text>
        {kind==='food'?<><Copy>{quantity}</Copy><Text style={styles.metric}>{kcal} kcal</Text><Copy>Protein {protein}g · Carbs {carbs}g · Fat {fat}g</Copy><Copy muted>Source: entered by you</Copy></>:<Copy muted>Source: manual scale reading</Copy>}
        <Copy>{date.toLocaleString()}</Copy><Copy muted>{Intl.DateTimeFormat().resolvedOptions().timeZone}</Copy>
        {reviewedAt!==null&&date.getTime()>reviewedAt?<Copy muted>Planned for later. This will count toward eaten totals only when that time arrives.</Copy>:null}
      </Surface>
      {differs?<Copy error>The listed calories and macro calculation differ ({Math.round(macroEnergy)} kcal). Check the portion and label basis. Fiber, alcohol and rounding can explain some differences.</Copy>:null}
      {kind==='weight'&&unusual?<Surface><Copy error>Unusual scale reading. Check the value and units before saving.</Copy><ChoiceGroup label="Use for future trend" value={influence} onChange={setInfluence} options={[{value:'normal',label:'Use normally'},{value:'reduced',label:'Reduce influence'},{value:'ignored',label:'Ignore for trend'}]} /><Copy muted>The raw reading is preserved. Trend calculations are not included in this first test build.</Copy></Surface>:null}
      <Button label={busy?'Saving…':kind==='food'?'Log food':'Save weight'} disabled={busy} onPress={()=>{void save();}} />
      <Button label="Edit entry" secondary disabled={busy} onPress={()=>setPhase('edit')} />
    </>:null}
    {phase==='saved'?<>
      <Surface><Copy>{kind==='food'?'Your food entry is saved.':'Your scale reading is saved.'}</Copy><Copy muted>Stored on this device, ready for your next visit.</Copy></Surface>
      <Button label="View my journal" onPress={()=>router.replace(kind==='food'?{pathname:'/food',params:{date:localDate(date)}}:'/weight')} />
      {kind==='food'?<Button label="Undo food entry" secondary disabled={busy} onPress={()=>{
        if (!token.current) return;
        setBusy(true);undoFood(db,token.current).then(()=>{token.current=null;setPhase('edit');}).catch((e:Error)=>setError(e.message)).finally(()=>setBusy(false));
      }} />:null}
    </>:<Button label="Close" secondary disabled={busy} onPress={()=>router.canGoBack()?router.back():router.replace('/')} />}
    {error?<Copy error>{error}</Copy>:null}
    </View>
  </Screen>;
}
const styles=StyleSheet.create({form:{width:'100%',maxWidth:560,alignSelf:'center',gap:20},heading:{color:colors.text,fontSize:24,fontWeight:'600'},metric:{color:colors.accent,fontSize:36,fontWeight:'600'}});
