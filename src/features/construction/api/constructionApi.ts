import type { ApiResponse } from '@workpulse/shared';
import { apiClient } from '@/lib/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/store';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import type { AxiosError } from 'axios';

export interface TRFI       { _id:string;rfiNumber:string;subject:string;question:string;description?:string;status:string;priority:string;impact:string;costImpact?:number;scheduleDays?:number;schedImpact?:number;submittedById:string;assignedToId?:string;dueDate?:string;answeredDate?:string;responses:Array<{_id:string;responderId:string;respondedBy?:string;content:string;isOfficial:boolean;createdAt:string;respondedAt?:string}>;tags:string[];section?:string;drawingReference?:string;discipline?:string;projectId:string;createdAt:string;updatedAt:string }
export interface TSubmittal { _id:string;submittalNumber:string;title:string;type:string;status:string;specSection?:string;submittedById:string;reviewerId?:string;requiredDate?:string;returnedDate?:string;revisionNumber:number;reviewNotes?:string;projectId:string;createdAt:string;updatedAt:string }
export interface TDailyReport { _id:string;reportNumber:string;reportDate:string;totalHeadcount:number;totalManHours:number;weather:Array<{time:string;conditions:string;temp?:number}>;crew:Array<{trade:string;company:string;headcount:number;hours:number}>;workCompleted:Array<{area:string;description:string;percentComplete?:number}>;safetyObservations:string;delaysIssues:string;notes:string;isSubmitted:boolean;projectId:string;createdAt:string }
export interface ICOLineItem  { description:string;quantity:number;unit:string;unitCost:number;totalCost:number;category:string }
export interface TChangeOrder { _id:string;coNumber:string;title:string;type:string;status:string;costImpact:number;scheduleDays:number;scheduleImpact?:number;totalCost?:number;laborCost:number;materialCost:number;description?:string;lineItems?:ICOLineItem[];isApproved?:boolean;initiatedById:string;approvedDate?:string;approvedById?:string;rejectionReason?:string;projectId:string;createdAt:string;updatedAt:string }
export type PublicChangeOrder = TChangeOrder;
export interface TSafetyIncident { _id:string;incidentNumber:string;title:string;type:string;status:string;incidentDate:string;location:string;description:string;oshaRecordable:boolean;injuredParty?:{name:string;company:string;trade:string};correctiveActions:string[];reportedById:string;closedDate?:string;projectId:string;createdAt:string }
export interface TPunchListItem { _id:string;itemNumber:string;description:string;location:string;status:string;priority:string;assignedTo?:string;responsible:string;dueDate?:string;completedDate?:string;verifiedDate?:string;notes:string;trade?:string;room?:string;projectId:string;createdAt:string }
export type PublicPunchItem = TPunchListItem;
export type PublicRFI = TRFI;

const withWs = (wsId:string) => ({headers:{'X-Workspace-ID':wsId}});
const errMsg = (e:unknown) => {const ax=e as AxiosError<ApiResponse>;return ax.response?.data?.message??'Operation failed';};
const useWsId = () => useAppSelector(selectActiveWorkspace)?._id??'';

export const constructionApi = {
  getSummary:       (pId:string,wsId:string) => apiClient.get<ApiResponse<Record<string,unknown>>>(`/construction/project/${pId}/summary`,withWs(wsId)).then(r=>r.data),
  getRFIs:          (pId:string,wsId:string,params?:Record<string,string>) => apiClient.get<ApiResponse<TRFI[]>>(`/construction/project/${pId}/rfis`,{...withWs(wsId),params}).then(r=>r.data),
  getRFIStats:      (pId:string,wsId:string) => apiClient.get(`/construction/project/${pId}/rfis/stats`,withWs(wsId)).then((r) => (r.data as ApiResponse<Array<{_id:string;count:number}>>).data),
  createRFI:        (pId:string,wsId:string,data:Record<string,unknown>) => apiClient.post<ApiResponse<TRFI>>(`/construction/project/${pId}/rfis`,data,withWs(wsId)).then(r=>r.data),
  updateRFI:        (id:string,wsId:string,data:Record<string,unknown>) => apiClient.patch<ApiResponse<TRFI>>(`/construction/rfis/${id}`,data,withWs(wsId)).then(r=>r.data),
  respondToRFI:     (id:string,wsId:string,content:string,isOfficial:boolean) => apiClient.post<ApiResponse<TRFI>>(`/construction/rfis/${id}/respond`,{content,isOfficial},withWs(wsId)).then(r=>r.data),
  getSubmittals:    (pId:string,wsId:string) => apiClient.get<ApiResponse<TSubmittal[]>>(`/construction/project/${pId}/submittals`,withWs(wsId)).then(r=>r.data),
  createSubmittal:  (pId:string,wsId:string,data:Record<string,unknown>) => apiClient.post<ApiResponse<TSubmittal>>(`/construction/project/${pId}/submittals`,data,withWs(wsId)).then(r=>r.data),
  updateSubmittal:  (id:string,wsId:string,data:Record<string,unknown>) => apiClient.patch<ApiResponse<TSubmittal>>(`/construction/submittals/${id}`,data,withWs(wsId)).then(r=>r.data),
  getDailyReports:  (pId:string,wsId:string) => apiClient.get<ApiResponse<TDailyReport[]>>(`/construction/project/${pId}/reports`,withWs(wsId)).then(r=>r.data),
  createDailyReport:(pId:string,wsId:string,data:Record<string,unknown>) => apiClient.post<ApiResponse<TDailyReport>>(`/construction/project/${pId}/reports`,data,withWs(wsId)).then(r=>r.data),
  getChangeOrders:  (pId:string,wsId:string) => apiClient.get<ApiResponse<TChangeOrder[]>>(`/construction/project/${pId}/cos`,withWs(wsId)).then(r=>r.data),
  getCOSummary:     (pId:string,wsId:string) => apiClient.get<ApiResponse<Array<{_id:string;count:number;totalCost:number;totalDays:number}>>>(`/construction/project/${pId}/cos/summary`,withWs(wsId)).then(r=>r.data),
  createChangeOrder:(pId:string,wsId:string,data:Record<string,unknown>) => apiClient.post<ApiResponse<TChangeOrder>>(`/construction/project/${pId}/cos`,data,withWs(wsId)).then(r=>r.data),
  updateChangeOrder:(id:string,wsId:string,data:Record<string,unknown>) => apiClient.patch<ApiResponse<TChangeOrder>>(`/construction/cos/${id}`,data,withWs(wsId)).then(r=>r.data),
  getIncidents:     (pId:string,wsId:string) => apiClient.get<ApiResponse<TSafetyIncident[]>>(`/construction/project/${pId}/incidents`,withWs(wsId)).then(r=>r.data),
  createIncident:   (pId:string,wsId:string,data:Record<string,unknown>) => apiClient.post<ApiResponse<TSafetyIncident>>(`/construction/project/${pId}/incidents`,data,withWs(wsId)).then(r=>r.data),
  updateIncident:   (id:string,wsId:string,data:Record<string,unknown>) => apiClient.patch<ApiResponse<TSafetyIncident>>(`/construction/incidents/${id}`,data,withWs(wsId)).then(r=>r.data),
  getPunchList:     (pId:string,wsId:string,params?:Record<string,string>) => apiClient.get<ApiResponse<TPunchListItem[]>>(`/construction/project/${pId}/punch`,{...withWs(wsId),params}).then(r=>r.data),
  getPunchStats:    (pId:string,wsId:string) => apiClient.get<ApiResponse<{byStatus:Array<{_id:string;count:number}>;total:number}>>(`/construction/project/${pId}/punch/stats`,withWs(wsId)).then(r=>r.data),
  createPunchItem:  (pId:string,wsId:string,data:Record<string,unknown>) => apiClient.post<ApiResponse<TPunchListItem>>(`/construction/project/${pId}/punch`,data,withWs(wsId)).then(r=>r.data),
  updatePunchItem:  (id:string,wsId:string,data:Record<string,unknown>) => apiClient.patch<ApiResponse<TPunchListItem>>(`/construction/punch/${id}`,data,withWs(wsId)).then(r=>r.data),
};

export const useConstructionSummary=(pId:string) => {const wsId=useWsId();return useQuery({queryKey:['construction',wsId,pId,'summary'],queryFn:async()=>(await constructionApi.getSummary(pId,wsId)).data!,enabled:!!wsId&&!!pId});};
export const useRFIs              =(pId:string) => {const wsId=useWsId();return useQuery({queryKey:['rfis',wsId,pId],queryFn:async()=>(await constructionApi.getRFIs(pId,wsId)).data??[],enabled:!!wsId&&!!pId,staleTime:2*60*1000});};
export const useRFIStats          =(pId:string) => {const wsId=useWsId();return useQuery({queryKey:['rfiStats',wsId,pId],queryFn:async()=>(await constructionApi.getRFIStats(pId,wsId))??[],enabled:!!wsId&&!!pId,staleTime:2*60*1000});};
export const useCreateRFI         =(pId:string) => {const wsId=useWsId();const qc=useQueryClient();return useMutation({mutationFn:(d:Record<string,unknown>)=>constructionApi.createRFI(pId,wsId,d),onSuccess:()=>{qc.invalidateQueries({queryKey:['rfis',wsId,pId]});toast.success('RFI created');},onError:(e)=>toast.error(errMsg(e))});};
export const useUpdateRFI         =() => {const wsId=useWsId();const qc=useQueryClient();return useMutation({mutationFn:({id,...d}:{id:string}&Record<string,unknown>)=>constructionApi.updateRFI(id,wsId,d),onSuccess:()=>toast.success('RFI updated'),onError:(e)=>toast.error(errMsg(e))});};
export const useRespondToRFI      =() => {const wsId=useWsId();return useMutation({mutationFn:({rfiId,content,isOfficial}:{rfiId:string;content:string;isOfficial:boolean})=>constructionApi.respondToRFI(rfiId,wsId,content,isOfficial),onSuccess:()=>toast.success('Response added'),onError:(e)=>toast.error(errMsg(e))});};
export const useRespondRFI        =useRespondToRFI;
export const useSubmittals        =(pId:string) => {const wsId=useWsId();return useQuery({queryKey:['submittals',wsId,pId],queryFn:async()=>(await constructionApi.getSubmittals(pId,wsId)).data??[],enabled:!!wsId&&!!pId});};
export const useCreateSubmittal   =(pId:string) => {const wsId=useWsId();const qc=useQueryClient();return useMutation({mutationFn:(d:Record<string,unknown>)=>constructionApi.createSubmittal(pId,wsId,d),onSuccess:()=>{qc.invalidateQueries({queryKey:['submittals',wsId,pId]});toast.success('Submittal created');},onError:(e)=>toast.error(errMsg(e))});};
export const useUpdateSubmittal   =() => {const wsId=useWsId();const qc=useQueryClient();return useMutation({mutationFn:({id,...d}:{id:string}&Record<string,unknown>)=>constructionApi.updateSubmittal(id,wsId,d),onSuccess:()=>toast.success('Submittal updated'),onError:(e)=>toast.error(errMsg(e))});};
export const useDailyReports      =(pId:string) => {const wsId=useWsId();return useQuery({queryKey:['reports',wsId,pId],queryFn:async()=>(await constructionApi.getDailyReports(pId,wsId)).data??[],enabled:!!wsId&&!!pId});};
export const useCreateDailyReport =(pId:string) => {const wsId=useWsId();const qc=useQueryClient();return useMutation({mutationFn:(d:Record<string,unknown>)=>constructionApi.createDailyReport(pId,wsId,d),onSuccess:()=>{qc.invalidateQueries({queryKey:['reports',wsId,pId]});toast.success('Daily report created');},onError:(e)=>toast.error(errMsg(e))});};
export const useChangeOrders      =(pId:string) => {const wsId=useWsId();return useQuery({queryKey:['cos',wsId,pId],queryFn:async()=>(await constructionApi.getChangeOrders(pId,wsId)).data??[],enabled:!!wsId&&!!pId});};
export const useCOStats          =(pId:string) => {const wsId=useWsId();return useQuery({queryKey:['cosSummary',wsId,pId],queryFn:async()=>(await constructionApi.getCOSummary(pId,wsId)).data??[],enabled:!!wsId&&!!pId,staleTime:2*60*1000});};
export const useCreateChangeOrder =(pId:string) => {const wsId=useWsId();const qc=useQueryClient();return useMutation({mutationFn:(d:Record<string,unknown>)=>constructionApi.createChangeOrder(pId,wsId,d),onSuccess:()=>{qc.invalidateQueries({queryKey:['cos',wsId,pId]});qc.invalidateQueries({queryKey:['cosSummary',wsId,pId]});toast.success('Change Order created');},onError:(e)=>toast.error(errMsg(e))});};
export const useCreateCO          =useCreateChangeOrder;
export const useApproveCO         =(pId:string) => {const wsId=useWsId();const qc=useQueryClient();return useMutation({mutationFn:(id:string)=>constructionApi.updateChangeOrder(id,wsId,{status:'approved'}),onSuccess:()=>{qc.invalidateQueries({queryKey:['cos',wsId,pId]});qc.invalidateQueries({queryKey:['cosSummary',wsId,pId]});toast.success('Change Order approved');},onError:(e)=>toast.error(errMsg(e))});};
export const useUpdateChangeOrder =() => {const wsId=useWsId();const qc=useQueryClient();return useMutation({mutationFn:({id,...d}:{id:string}&Record<string,unknown>)=>constructionApi.updateChangeOrder(id,wsId,d),onSuccess:(r)=>{toast.success(`CO ${r.data?.status}`);},onError:(e)=>toast.error(errMsg(e))});};
export const useIncidents         =(pId:string) => {const wsId=useWsId();return useQuery({queryKey:['incidents',wsId,pId],queryFn:async()=>(await constructionApi.getIncidents(pId,wsId)).data??[],enabled:!!wsId&&!!pId});};
export const useCreateIncident    =(pId:string) => {const wsId=useWsId();const qc=useQueryClient();return useMutation({mutationFn:(d:Record<string,unknown>)=>constructionApi.createIncident(pId,wsId,d),onSuccess:()=>{qc.invalidateQueries({queryKey:['incidents',wsId,pId]});toast.success('Incident reported');},onError:(e)=>toast.error(errMsg(e))});};
export const useUpdateIncident    =() => {const wsId=useWsId();return useMutation({mutationFn:({id,...d}:{id:string}&Record<string,unknown>)=>constructionApi.updateIncident(id,wsId,d),onSuccess:()=>toast.success('Incident updated'),onError:(e)=>toast.error(errMsg(e))});};
export const usePunchList         =(pId:string,params?:Record<string,string>) => {const wsId=useWsId();return useQuery({queryKey:['punch',wsId,pId,params],queryFn:async()=>(await constructionApi.getPunchList(pId,wsId,params)).data??[],enabled:!!wsId&&!!pId});};
export const usePunchItems        =(pId:string,params?:Record<string,string>) => usePunchList(pId,params);
export const usePunchStats        =(pId:string) => {const wsId=useWsId();return useQuery({queryKey:['punchStats',wsId,pId],queryFn:async()=>(await constructionApi.getPunchStats(pId,wsId)).data,enabled:!!wsId&&!!pId,staleTime:2*60*1000});};
export const useCreatePunchItem   =(pId:string) => {const wsId=useWsId();const qc=useQueryClient();return useMutation({mutationFn:(d:Record<string,unknown>)=>constructionApi.createPunchItem(pId,wsId,d),onSuccess:()=>{qc.invalidateQueries({queryKey:['punch',wsId,pId]});toast.success('Punch item added');},onError:(e)=>toast.error(errMsg(e))});};
export const useUpdatePunchItem   =(pId?:string) => {const wsId=useWsId();const qc=useQueryClient();return useMutation({mutationFn:({id,...d}:{id:string}&Record<string,unknown>)=>constructionApi.updatePunchItem(id,wsId,d),onSuccess:()=>{qc.invalidateQueries({queryKey:['punch',wsId,pId??'']});},onError:(e)=>toast.error(errMsg(e))});};
