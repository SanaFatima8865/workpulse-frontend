import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  HardHat, MessageSquare, Package, FileText, DollarSign,
  AlertTriangle, CheckSquare, Plus, Check, Clock,
  ChevronDown, ChevronUp,
} from 'lucide-react';

import { useTitle }   from '@/hooks';
import { Card }       from '@/components/ui/Card';
import { Badge }      from '@/components/ui/Badge';
import { Button }     from '@/components/ui/Button';
import { Input }      from '@/components/ui/Input';
import { Modal }      from '@/components/ui/Modal';
import { Skeleton }   from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Progress }   from '@/components/ui/Progress';
import { cn }         from '@/lib/cn';
import { formatDate, formatCurrency, formatRelative } from '@/lib/utils';
import { useProjects } from '@/features/projects';
import {
  useRFIs, useCreateRFI, useUpdateRFI, useRespondToRFI,
  useSubmittals, useCreateSubmittal, useUpdateSubmittal,
  useDailyReports, useCreateDailyReport,
  useChangeOrders, useCreateChangeOrder, useUpdateChangeOrder,
  useIncidents, useCreateIncident,
  usePunchList, useCreatePunchItem, useUpdatePunchItem,
} from '@/features/construction/api/constructionApi';
import type { TRFI, TPunchListItem } from '@/features/construction/api/constructionApi';

const RFI_COLORS: Record<string,string>   = { open:'bg-blue-100 text-blue-700', answered:'bg-emerald-100 text-emerald-700', closed:'bg-gray-100 text-gray-600', draft:'bg-yellow-100 text-yellow-700', void:'bg-red-100 text-red-600' };
const CO_COLORS: Record<string,string>    = { draft:'bg-gray-100 text-gray-600', pending_owner:'bg-amber-100 text-amber-700', pending_gc:'bg-blue-100 text-blue-700', approved:'bg-emerald-100 text-emerald-700', rejected:'bg-red-100 text-red-600', void:'bg-gray-100 text-gray-500' };
const PUNCH_COLORS: Record<string,string> = { open:'bg-red-100 text-red-700', in_progress:'bg-blue-100 text-blue-700', completed:'bg-amber-100 text-amber-700', verified:'bg-emerald-100 text-emerald-700', void:'bg-gray-100 text-gray-500' };
const INC_COLORS: Record<string,string>   = { near_miss:'bg-yellow-100 text-yellow-700', first_aid:'bg-amber-100 text-amber-700', recordable:'bg-orange-100 text-orange-700', lost_time:'bg-red-100 text-red-700', fatality:'bg-red-900 text-red-100', property_damage:'bg-purple-100 text-purple-700', environmental:'bg-teal-100 text-teal-700' };
const SUB_COLORS: Record<string,string>   = { pending:'bg-gray-100 text-gray-600', submitted:'bg-blue-100 text-blue-700', under_review:'bg-amber-100 text-amber-700', approved:'bg-emerald-100 text-emerald-700', approved_as_noted:'bg-teal-100 text-teal-700', revise_resubmit:'bg-orange-100 text-orange-700', rejected:'bg-red-100 text-red-600', void:'bg-gray-100 text-gray-500' };

const TABS = [
  { id:'rfis', label:'RFIs', icon:<MessageSquare size={15}/> },
  { id:'submittals', label:'Submittals', icon:<Package size={15}/> },
  { id:'reports', label:'Daily Reports', icon:<FileText size={15}/> },
  { id:'cos', label:'Change Orders', icon:<DollarSign size={15}/> },
  { id:'safety', label:'Safety', icon:<AlertTriangle size={15}/> },
  { id:'punch', label:'Punch List', icon:<CheckSquare size={15}/> },
] as const;
type TabId = typeof TABS[number]['id'];

const RFIRow: React.FC<{rfi: TRFI}> = ({rfi}) => {
  const [exp, setExp] = React.useState(false);
  const [resp, setResp] = React.useState('');
  const respond = useRespondToRFI();
  const update  = useUpdateRFI();
  const overdue = rfi.dueDate && new Date(rfi.dueDate)<new Date() && rfi.status==='open';
  return (
    <div className="border border-surface-border dark:border-surface-dark-border rounded-xl overflow-hidden">
      <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-surface-secondary/30 transition-colors" onClick={()=>setExp(e=>!e)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-mono font-bold text-[var(--color-text-muted)]">{rfi.rfiNumber}</span>
            <span className={cn('text-2xs font-bold px-1.5 py-0.5 rounded capitalize', RFI_COLORS[rfi.status])}>{rfi.status.replace('_',' ')}</span>
            {rfi.impact!=='none' && <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 capitalize">{rfi.impact}</span>}
            {overdue && <span className="text-2xs font-bold text-red-500 flex items-center gap-0.5"><Clock size={10}/>Overdue</span>}
          </div>
          <p className="text-sm font-semibold text-[var(--color-text)] truncate">{rfi.subject}</p>
          {rfi.section && <p className="text-2xs text-[var(--color-text-muted)]">Section: {rfi.section}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {rfi.dueDate && <span className="text-xs text-[var(--color-text-muted)]">{formatDate(rfi.dueDate)}</span>}
          {exp ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </div>
      </div>
      {exp && (
        <div className="border-t border-surface-border dark:border-surface-dark-border p-4 bg-surface-secondary/20 space-y-3">
          <p className="text-sm text-[var(--color-text)] leading-relaxed">{rfi.question}</p>
          {rfi.drawingReference && <p className="text-xs text-[var(--color-text-muted)]">Drawing: {rfi.drawingReference}</p>}
          {rfi.responses.length>0 && (
            <div className="space-y-2 mt-3">
              <p className="text-2xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Responses ({rfi.responses.length})</p>
              {rfi.responses.map(r=>(
                <div key={r._id} className={cn('p-3 rounded-lg text-sm', r.isOfficial?'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900':'bg-white dark:bg-surface-dark-secondary border border-surface-border')}>
                  {r.isOfficial && <span className="text-2xs font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded mr-2">Official</span>}
                  <span className="text-2xs text-[var(--color-text-muted)]">{formatRelative(r.createdAt)}</span>
                  <p className="text-[var(--color-text)] leading-relaxed mt-1">{r.content}</p>
                </div>
              ))}
            </div>
          )}
          {rfi.status!=='answered' && rfi.status!=='closed' && (
            <div className="flex gap-2 mt-3">
              <textarea value={resp} onChange={e=>setResp(e.target.value)} placeholder="Add a response..." rows={2}
                className="flex-1 text-sm rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-[var(--color-text)]" />
              <div className="flex flex-col gap-1.5">
                <Button variant="primary" size="xs" loading={respond.isPending} disabled={!resp.trim()} onClick={()=>respond.mutate({rfiId:rfi._id,content:resp,isOfficial:true},{onSuccess:()=>setResp('')})}> Official</Button>
                <Button variant="secondary" size="xs" loading={respond.isPending} disabled={!resp.trim()} onClick={()=>respond.mutate({rfiId:rfi._id,content:resp,isOfficial:false},{onSuccess:()=>setResp('')})}>Comment</Button>
              </div>
            </div>
          )}
          {rfi.status==='answered' && <Button variant="secondary" size="xs" onClick={()=>update.mutate({id:rfi._id,status:'closed'})}>Close RFI</Button>}
        </div>
      )}
    </div>
  );
};

const PunchRow: React.FC<{item:TPunchListItem}> = ({item}) => {
  const update = useUpdatePunchItem();
  const NEXT: Record<string,string> = {open:'in_progress',in_progress:'completed',completed:'verified'};
  return (
    <div className="flex items-start gap-3 p-3.5 border border-surface-border dark:border-surface-dark-border rounded-xl hover:bg-surface-secondary/30 transition-colors">
      <button className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all', item.status==='verified'?'bg-emerald-500 border-emerald-500':item.status==='completed'?'bg-amber-400 border-amber-400':'border-surface-border-strong hover:border-brand-400')}
        onClick={()=>{const n=NEXT[item.status];if(n)update.mutate({id:item._id,status:n});}}>
        {(item.status==='verified'||item.status==='completed')&&<Check size={11} className="text-white"/>}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-2xs font-mono font-bold text-[var(--color-text-muted)]">{item.itemNumber}</span>
          <span className={cn('text-2xs font-bold px-1.5 py-0.5 rounded capitalize', PUNCH_COLORS[item.status])}>{item.status.replace('_',' ')}</span>
          <span className={cn('text-2xs font-bold px-1.5 py-0.5 rounded capitalize', {critical:'bg-red-100 text-red-700',high:'bg-orange-100 text-orange-700',medium:'bg-amber-100 text-amber-700',low:'bg-blue-100 text-blue-700'}[item.priority as string]??'')}>{item.priority}</span>
        </div>
        <p className={cn('text-sm font-medium text-[var(--color-text)]', item.status==='verified'&&'line-through text-[var(--color-text-muted)]')}>{item.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[var(--color-text-muted)]">📍 {item.location}</span>
          {item.assignedTo&&<span className="text-xs text-[var(--color-text-muted)]">→ {item.assignedTo}</span>}
        </div>
      </div>
    </div>
  );
};

const ConstructionPage: React.FC = () => {
  useTitle('Construction');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabId)??'rfis';
  const setTab = (t:TabId) => setSearchParams({tab:t});
  const navigate = useNavigate();
  const { data: projects=[] } = useProjects();
  const active = projects.filter(p=>!['completed','cancelled','on_hold'].includes(p.phase));
  const [projectId, setProjectId] = React.useState(''
  );
  React.useEffect(()=>{ if(!projectId&&active.length) setProjectId(active[0]._id); },[active.length]);
  const [createOpen,setCreateOpen] = React.useState(false);
  const {register,handleSubmit,reset,formState:{errors}} = useForm<Record<string,string>>();

  const {data:rfis=[],isLoading:rl}      = useRFIs(projectId);
  const {data:subs=[],isLoading:sl}      = useSubmittals(projectId);
  const {data:reports=[],isLoading:rol}  = useDailyReports(projectId);
  const {data:cos=[],isLoading:cl}       = useChangeOrders(projectId);
  const {data:incidents=[],isLoading:il} = useIncidents(projectId);
  const {data:punch=[],isLoading:pl}     = usePunchList(projectId);

  const createRFI    = useCreateRFI(projectId);
  const createSub    = useCreateSubmittal(projectId);
  const createReport = useCreateDailyReport(projectId);
  const createCO     = useCreateChangeOrder(projectId);
  const createInc    = useCreateIncident(projectId);
  const createPunch  = useCreatePunchItem(projectId);
  const updateCO     = useUpdateChangeOrder();

  const CREATORS: Record<TabId,(d:Record<string,string>)=>void> = {
    rfis:       d=>createRFI.mutate(d,{onSuccess:()=>{reset();setCreateOpen(false);}}),
    submittals: d=>createSub.mutate(d,{onSuccess:()=>{reset();setCreateOpen(false);}}),
    reports:    d=>createReport.mutate({...d,reportDate:d.reportDate||new Date().toISOString()},{onSuccess:()=>{reset();setCreateOpen(false);}}),
    cos:        d=>createCO.mutate({...d,costImpact:parseFloat(d.costImpact||'0'),scheduleDays:parseInt(d.scheduleDays||'0')},{onSuccess:()=>{reset();setCreateOpen(false);}}),
    safety:     d=>createInc.mutate(d,{onSuccess:()=>{reset();setCreateOpen(false);}}),
    punch:      d=>createPunch.mutate(d,{onSuccess:()=>{reset();setCreateOpen(false);}}),
  };

  if(!projectId) return <div className="p-6"><EmptyState icon={<HardHat size={28}/>} title="No active projects" description="Create a project to access construction workflows" action={{label:'Create Project',onClick:()=>navigate('/projects')}}/></div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-5 pb-10">
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--color-text)] flex items-center gap-2"><HardHat size={24} className="text-brand-600"/>Construction Workflows</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">RFIs · Submittals · Daily Reports · Change Orders · Safety · Punch Lists</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={projectId} onChange={e=>setProjectId(e.target.value)} className="h-9 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500">
            {active.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <Button variant="primary" size="sm" leftIcon={<Plus size={14}/>} onClick={()=>setCreateOpen(true)}>New</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          {label:'Open RFIs',   value:rfis.filter(r=>r.status==='open').length,           color:'text-blue-600',   bg:'bg-blue-50 dark:bg-blue-950/20',   tab:'rfis' as TabId},
          {label:'Submittals',  value:subs.filter(s=>s.status!=='approved').length,        color:'text-amber-600',  bg:'bg-amber-50 dark:bg-amber-950/20', tab:'submittals' as TabId},
          {label:'Pending COs', value:cos.filter(c=>['pending_owner','pending_gc'].includes(c.status)).length, color:'text-orange-600',bg:'bg-orange-50 dark:bg-orange-950/20',tab:'cos' as TabId},
          {label:'Open Punch',  value:punch.filter(p=>p.status==='open').length,           color:'text-red-600',    bg:'bg-red-50 dark:bg-red-950/20',     tab:'punch' as TabId},
          {label:'Incidents',   value:incidents.filter(i=>i.status!=='closed').length,     color:'text-rose-600',   bg:'bg-rose-50 dark:bg-rose-950/20',   tab:'safety' as TabId},
          {label:'Reports',     value:reports.length,                                        color:'text-teal-600',   bg:'bg-teal-50 dark:bg-teal-950/20',   tab:'reports' as TabId},
        ].map(s=>(
          <button key={s.label} onClick={()=>setTab(s.tab)} className={cn('rounded-xl p-3 text-center transition-all hover:scale-105 cursor-pointer',s.bg,activeTab===s.tab&&'ring-2 ring-brand-400')}>
            <p className={cn('text-xl font-bold',s.color)}>{s.value}</p>
            <p className="text-2xs text-[var(--color-text-muted)] mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-1 bg-surface-secondary dark:bg-surface-dark-tertiary rounded-xl p-1.5 w-fit flex-wrap">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',activeTab===t.id?'bg-white dark:bg-surface-dark-secondary text-brand-700 dark:text-brand-300 shadow-card':'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
        {activeTab==='rfis' && (
          <div className="space-y-3">
            {rl?[1,2,3].map(i=><Skeleton key={i} height={80} className="rounded-xl"/>):
             rfis.length===0?<EmptyState icon={<MessageSquare size={24}/>} title="No RFIs yet" description="Track questions between contractor and design team" action={{label:'Create RFI',onClick:()=>setCreateOpen(true)}}/>:
             rfis.map(rfi=><RFIRow key={rfi._id} rfi={rfi}/>)}
          </div>
        )}

        {activeTab==='submittals' && (
          <Card padding="none">
            <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {sl?<div className="p-4 space-y-2">{[1,2,3].map(i=><Skeleton key={i} height={60}/>)}</div>:
               subs.length===0?<EmptyState icon={<Package size={24}/>} title="No submittals" description="Track shop drawings, product data, and samples" action={{label:'Add Submittal',onClick:()=>setCreateOpen(true)}} size="sm"/>:
               subs.map(sub=>(
                <div key={sub._id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono font-bold text-[var(--color-text-muted)]">{sub.submittalNumber}</span>
                      <span className={cn('text-2xs font-bold px-1.5 py-0.5 rounded capitalize', SUB_COLORS[sub.status])}>{sub.status.replace(/_/g,' ')}</span>
                      <span className="text-2xs text-[var(--color-text-muted)] capitalize">{sub.type.replace('_',' ')}</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{sub.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {sub.requiredDate&&<span className="text-xs text-[var(--color-text-muted)]">{formatDate(sub.requiredDate)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab==='reports' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rol?[1,2,3].map(i=><Skeleton key={i} height={140} className="rounded-xl"/>):
             reports.length===0?<div className="col-span-3"><EmptyState icon={<FileText size={24}/>} title="No daily reports" description="Log daily site activity and progress" action={{label:'Create Report',onClick:()=>setCreateOpen(true)}}/></div>:
             reports.map(r=>(
              <Card key={r._id} padding="md">
                <div className="flex items-center justify-between mb-2">
                  <div><p className="text-xs font-mono font-bold text-[var(--color-text-muted)]">{r.reportNumber}</p><p className="text-sm font-bold text-[var(--color-text)]">{formatDate(r.reportDate)}</p></div>
                  {r.isSubmitted?<Badge variant="secondary" size="sm">Submitted</Badge>:<Badge variant="warning" size="sm">Draft</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[{l:'Headcount',v:r.totalHeadcount},{l:'Man Hours',v:r.totalManHours.toFixed(0)}].map(({l,v})=>(
                    <div key={l} className="bg-surface-secondary dark:bg-surface-dark-tertiary rounded-lg p-2 text-center"><p className="text-lg font-bold text-[var(--color-text)]">{v}</p><p className="text-2xs text-[var(--color-text-muted)]">{l}</p></div>
                  ))}
                </div>
                {r.delaysIssues&&<p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><AlertTriangle size={10}/>{r.delaysIssues.slice(0,80)}</p>}
              </Card>
            ))}
          </div>
        )}

        {activeTab==='cos' && (
          <Card padding="none">
            <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {cl?<div className="p-4 space-y-2">{[1,2,3].map(i=><Skeleton key={i} height={60}/>)}</div>:
               cos.length===0?<EmptyState icon={<DollarSign size={24}/>} title="No change orders" description="Track scope changes and approval status" action={{label:'Create CO',onClick:()=>setCreateOpen(true)}} size="sm"/>:
               cos.map(co=>(
                <div key={co._id} className="flex items-start gap-3 px-4 py-3.5 hover:bg-surface-secondary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono font-bold text-[var(--color-text-muted)]">{co.coNumber}</span>
                      <span className={cn('text-2xs font-bold px-1.5 py-0.5 rounded capitalize', CO_COLORS[co.status])}>{co.status.replace(/_/g,' ')}</span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-text)] truncate">{co.title}</p>
                    <span className={cn('text-xs font-bold', co.costImpact>0?'text-amber-600':co.costImpact<0?'text-emerald-600':'text-[var(--color-text-muted)]')}>{formatCurrency(co.costImpact)}</span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {co.status==='draft'&&<Button variant="secondary" size="xs" onClick={()=>updateCO.mutate({id:co._id,status:'pending_owner'})}>Submit</Button>}
                    {['pending_owner','pending_gc'].includes(co.status)&&<>
                      <Button variant="primary" size="xs" onClick={()=>updateCO.mutate({id:co._id,status:'approved'})}>Approve</Button>
                      <Button variant="danger" size="xs" onClick={()=>updateCO.mutate({id:co._id,status:'rejected'})}>Reject</Button>
                    </>}
                  </div>
                </div>
              ))}
            </div>
            {cos.length>0&&(
              <div className="px-4 py-3 border-t border-surface-border dark:border-surface-dark-border bg-surface-secondary/30 flex items-center justify-between">
                <p className="text-xs text-[var(--color-text-muted)]">Approved: {formatCurrency(cos.filter(c=>c.status==='approved').reduce((s,c)=>s+c.costImpact,0))}</p>
                <p className="text-xs text-amber-600 font-semibold">Pending: {formatCurrency(cos.filter(c=>['pending_owner','pending_gc'].includes(c.status)).reduce((s,c)=>s+c.costImpact,0))}</p>
              </div>
            )}
          </Card>
        )}

        {activeTab==='safety' && (
          <div className="space-y-3">
            {il?[1,2,3].map(i=><Skeleton key={i} height={80} className="rounded-xl"/>):
             incidents.length===0?<EmptyState icon={<AlertTriangle size={24}/>} title="No incidents recorded" description="Report near misses, injuries, and safety observations" action={{label:'Report Incident',onClick:()=>setCreateOpen(true)}}/>:
             incidents.map(inc=>(
              <div key={inc._id} className="flex items-start gap-3 p-4 border border-surface-border dark:border-surface-dark-border rounded-xl hover:bg-surface-secondary/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono font-bold text-[var(--color-text-muted)]">{inc.incidentNumber}</span>
                    <span className={cn('text-2xs font-bold px-1.5 py-0.5 rounded capitalize', INC_COLORS[inc.type])}>{inc.type.replace('_',' ')}</span>
                    {inc.oshaRecordable&&<span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">OSHA</span>}
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{inc.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{formatDate(inc.incidentDate)} · {inc.location}</p>
                </div>
                <span className={cn('text-2xs font-bold px-2 py-0.5 rounded-full capitalize shrink-0', inc.status==='closed'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700')}>{inc.status.replace('_',' ')}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab==='punch' && (
          <div className="space-y-2">
            {pl?[1,2,3].map(i=><Skeleton key={i} height={72} className="rounded-xl"/>):
             punch.length===0?<EmptyState icon={<CheckSquare size={24}/>} title="Punch list empty" description="Add deficiency items for closeout and QC" action={{label:'Add Item',onClick:()=>setCreateOpen(true)}}/>:
             punch.map(item=><PunchRow key={item._id} item={item}/>)}
            {punch.length>0&&(
              <div className="flex items-center justify-between p-3 bg-surface-secondary dark:bg-surface-dark-tertiary rounded-xl text-xs">
                <span>{punch.length} items</span>
                <Progress value={punch.filter(p=>p.status==='verified').length/punch.length*100} size="xs" color="brand" className="w-32"/>
                <span className="text-emerald-600 font-semibold">{punch.filter(p=>p.status==='verified').length}/{punch.length} verified</span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <Modal open={createOpen} onClose={()=>setCreateOpen(false)} title={`New ${TABS.find(t=>t.id===activeTab)?.label}`} size="md"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" size="md" onClick={()=>setCreateOpen(false)}>Cancel</Button><Button variant="primary" size="md" onClick={handleSubmit(d=>CREATORS[activeTab](d))}>Create</Button></div>}>
        <form className="space-y-4" noValidate>
          {activeTab==='rfis'&&(<>
            <Input {...register('subject',{required:true})} label="Subject *" error={errors.subject?'Required':undefined} autoFocus/>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Question *</label><textarea {...register('question',{required:true})} rows={3} placeholder="Describe your question..." className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"/></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Priority</label><select {...register('priority')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"><option value="normal">Normal</option><option value="high">High</option><option value="critical">Critical</option><option value="low">Low</option></select></div>
              <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Impact</label><select {...register('impact')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"><option value="none">None</option><option value="cost">Cost</option><option value="schedule">Schedule</option><option value="both">Both</option></select></div>
              <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Due Date</label><input {...register('dueDate')} type="date" className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500"/></div>
            </div>
            <div className="grid grid-cols-2 gap-3"><Input {...register('section')} label="Spec Section" placeholder="03 30 00"/><Input {...register('drawingReference')} label="Drawing Ref" placeholder="A-101"/></div>
          </>)}
          {activeTab==='submittals'&&(<>
            <Input {...register('title',{required:true})} label="Title *" error={errors.title?'Required':undefined} autoFocus/>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Type</label><select {...register('type')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"><option value="shop_drawing">Shop Drawing</option><option value="product_data">Product Data</option><option value="sample">Sample</option><option value="test_report">Test Report</option><option value="certificate">Certificate</option><option value="operation_manual">Operation Manual</option><option value="other">Other</option></select></div>
              <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Required By</label><input {...register('requiredDate')} type="date" className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500"/></div>
            </div>
            <Input {...register('specSection')} label="Spec Section" placeholder="05 12 00"/>
          </>)}
          {activeTab==='reports'&&(<>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Report Date</label><input {...register('reportDate')} type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500"/></div>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Notes</label><textarea {...register('notes')} rows={3} placeholder="Work completed today..." className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"/></div>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Delays / Issues</label><textarea {...register('delaysIssues')} rows={2} placeholder="Any delays or issues..." className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"/></div>
          </>)}
          {activeTab==='cos'&&(<>
            <Input {...register('title',{required:true})} label="Change Order Title *" error={errors.title?'Required':undefined} autoFocus/>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Description</label><textarea {...register('description')} rows={2} placeholder="Scope of change..." className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Type</label><select {...register('type')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"><option value="owner_directed">Owner Directed</option><option value="unforeseen_conditions">Unforeseen Conditions</option><option value="design_change">Design Change</option><option value="rfi_resolution">RFI Resolution</option><option value="scope_reduction">Scope Reduction</option><option value="other">Other</option></select></div>
              <Input {...register('costImpact')} label="Cost Impact ($)" type="number" placeholder="25000"/>
            </div>
            <Input {...register('scheduleDays')} label="Schedule Impact (days)" type="number" placeholder="0"/>
          </>)}
          {activeTab==='safety'&&(<>
            <Input {...register('title',{required:true})} label="Incident Title *" error={errors.title?'Required':undefined} autoFocus/>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Type *</label><select {...register('type',{required:true})} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"><option value="near_miss">Near Miss</option><option value="first_aid">First Aid</option><option value="recordable">Recordable</option><option value="lost_time">Lost Time</option><option value="property_damage">Property Damage</option><option value="environmental">Environmental</option></select></div>
              <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Date</label><input {...register('incidentDate',{required:true})} type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500"/></div>
            </div>
            <Input {...register('location',{required:true})} label="Location *" placeholder="Level 3, Grid B-4"/>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Description *</label><textarea {...register('description',{required:true})} rows={3} placeholder="What happened..." className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"/></div>
            <div className="flex items-center gap-3"><input type="checkbox" {...register('oshaRecordable')} className="w-4 h-4 rounded border-surface-border text-brand-600 focus:ring-brand-500"/><label className="text-sm font-medium text-[var(--color-text)]">OSHA Recordable</label></div>
          </>)}
          {activeTab==='punch'&&(<>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Description *</label><textarea {...register('description',{required:true})} rows={2} placeholder="Describe the deficiency..." className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" autoFocus/></div>
            <Input {...register('location',{required:true})} label="Location *" placeholder="Room 204, North wall"/>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Priority</label><select {...register('priority')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option><option value="low">Low</option></select></div>
              <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-[var(--color-text)]">Due Date</label><input {...register('dueDate')} type="date" className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500"/></div>
            </div>
            <div className="grid grid-cols-2 gap-3"><Input {...register('responsible')} label="Responsible Party" placeholder="Smith Drywall LLC"/><Input {...register('assignedTo')} label="Assigned To" placeholder="John Smith"/></div>
          </>)}
        </form>
      </Modal>
    </div>
  );
};

export default ConstructionPage;
