export interface IEditVacationRequestStates {
  IsLoading: boolean;
  CompanyDepartments: any;
  isFutuerData: boolean;
  currentUserId: number;
  statusRequest: string;
  isBiggerThenStartData: boolean;
  isPolicyVacationChacke: boolean;
  popoverOpen: boolean;
  IsManager: string;
  ComapnyManagerDisabled: boolean;
  requestValues: itemObject;
  approvalData: approvalObject;
}
export interface itemObject {
  Id: number;
  user: any;
  userId: number;
  RequestDate: any;
  CompanyManagerId: number;
  CompanyDepartmenId: number;
  CompanyDepartmen: string;
  DepartmentManagerId: number;
  FromDate: Date;
  ToDate: Date;
  numberOfDays: number;
  haveVacationDays: string;
  vacationDuringActiveProject: string;
  vacationDuringActiveProjectEX: string;
  policyVacationChacke: boolean;
}
export interface approvalObject {
  /* Department Manager Approval Values */
  DManagerId: number;
  DManagerName: string;
  DManagerEmail: string;
  CompanyDepartmen: string;
  approvalDManagerStatus: string;
  DManagerSignature: string;
  DManagerRemarks: string;

  /* Company Manager Approval Values */
  CompanyManagerId: number;
  CompanyManagerName: string;
  CompanyManagerEmail: string;
  approvalManagerStatus: string;
  CompanyManagerSignature: string;
  ManagerRemarks: string;
}
