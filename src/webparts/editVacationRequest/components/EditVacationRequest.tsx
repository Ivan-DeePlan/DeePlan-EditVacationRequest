import * as React from "react";
import styles from "./EditVacationRequest.module.scss";
import "./style.css";
import getSP from "../PnPjsConfig";
import { AiOutlineCheck, AiOutlineClose, AiOutlineSend } from "react-icons/ai";
import { IoCloseCircleOutline } from "react-icons/io5";
import { IEditVacationRequestProps } from "./IEditVacationRequestProps";
import { IEditVacationRequestStates } from "./IEditVacationRequestStates";
import { Constants } from "../Models/Constants";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { he } from "date-fns/locale";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import stylisRTLPlugin from "stylis-plugin-rtl";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import Checkbox from "@mui/material/Checkbox";
import { TextField } from "@material-ui/core";
import {
  Row,
  Col,
  Container,
  Alert,
  InputGroup,
  Input,
  Popover,
  PopoverHeader,
  PopoverBody,
} from "reactstrap";
import Box from "@mui/material/Box";
import {
  Button,
  FormControlLabel,
  TextField as MaterialTextField,
} from "@mui/material";
import { Autocomplete } from "@material-ui/lab";

export default class VacationRequest extends React.Component<
  IEditVacationRequestProps,
  IEditVacationRequestStates
> {
  sp = getSP(this.props.context);

  //* use for direction rtl
  cacheRtl = createCache({
    key: "muirtl",
    stylisPlugins: [stylisRTLPlugin],
  });

  constructor(props: IEditVacationRequestProps) {
    super(props);
    this.state = {
      statusRequest: "בתהליך...",
      ComapnyManagerDisabled: false,
      IsManager: "No",
      popoverOpen: false,
      IsLoading: false,
      isFutuerData: false,
      currentUserId: 0,
      isPolicyVacationChacke: false,
      isBiggerThenStartData: false,
      CompanyDepartments: [],
      requestValues: {
        Id: 0,
        user: "",
        userId: 0,
        RequestDate: new Date(),
        CompanyDepartmenId: 0,
        CompanyDepartmen: "",
        CompanyManagerId: 11,
        DepartmentManagerId: 0,
        FromDate: null,
        ToDate: null,
        numberOfDays: 0,
        policyVacationChacke: true,
        haveVacationDays: "",
        vacationDuringActiveProject: "",
        vacationDuringActiveProjectEX: "",
      },
      approvalData: {
        /* Department Manager Approval Values */
        DManagerId: 0,
        DManagerName: "",
        DManagerEmail: "",
        CompanyDepartmen: "",
        approvalDManagerStatus: "בחר",
        DManagerSignature: "",
        DManagerRemarks: "",

        /* Company Manager Approval Values */
        CompanyManagerId: 0,
        CompanyManagerName: "",
        CompanyManagerEmail: "",
        approvalManagerStatus: "בחר",
        CompanyManagerSignature: "",
        ManagerRemarks: "",
      },
    };
  }

  //* PeoplePicker styles
  public _styles: any = {
    root: { maxWidth: "300px" },
    input: { with: "100%" },
  };

  componentDidMount() {
    //* Start Loader
    this.setState({
      IsLoading: true,
    });

    //* Reset all the values in the form
    this.ResetForm();
  }

  ResetForm = async () => {
    //* get item by id.
    // const url = new URL(window.location.href);
    // const FormID = Number(url.searchParams.get("FormID"));
    await this.sp.web.lists
      .getByTitle("VacationRequests")
      .items.getById(162)()
      .then((item: any) => {
        console.log(item);
        this.setState({
          statusRequest: item.StatusRequest,
          IsManager: item.IsManager,
          requestValues: {
            ...this.state.requestValues,
            userId: item.RequestedByUserId,
            RequestDate: item.Created,
            CompanyDepartmenId: item.DepartmentId,
            DepartmentManagerId: item.ApprovalsId && item.ApprovalsId[0],
            FromDate: item.FromDate,
            ToDate: item.ToDate,
            numberOfDays: item.NumberOfVacationDays,
            haveVacationDays: item.haveVacationDaysLeft,
            vacationDuringActiveProject: item.VacationDuringActiveProject,
            vacationDuringActiveProjectEX: item.vacationDuringActiveProjectEX,
          },
          approvalData: {
            ...this.state.approvalData,
            approvalDManagerStatus: item.DManager,
            approvalManagerStatus: item.CManager,
          },
        });
        //* get current user and department
        this.sp.web.currentUser
          .select()()
          .catch((error) => {
            console.log(error);
          })
          .then((user: any) => {
            this.setState({ currentUserId: user.Id });
          });

        //* get requested user detail
        this.sp.web
          .getUserById(item.RequestedByUserId)()
          .then((user) => {
            this.setState({
              requestValues: {
                ...this.state.requestValues,
                user: user,
              },
            });
          });

        //* get all the items from a Departments list
        this.sp.web.lists
          .getByTitle("CompanyDepartments")
          .items()
          .catch((error) => {
            console.log(error);
          })
          .then((Company: any) => {
            this.setState({
              CompanyDepartments: Company,
            });

            //*Find and set CompanyManager details
            const CompanyManagerDetails = Company.find(
              (company: any) => company.Title === 'מנכ"ל'
            );
            this.setState({
              approvalData: {
                ...this.state.approvalData,
                CompanyManagerId: CompanyManagerDetails.DepartmentManagerId,
                CompanyManagerName: CompanyManagerDetails.DepartmentManagerName,
                CompanyManagerEmail:
                  CompanyManagerDetails.DepartmentManagerEmail,
                CompanyManagerSignature:
                  CompanyManagerDetails.DepartmentManagerName +
                  " " +
                  new Date().toLocaleDateString("pt-PT"),
              },
            });

            //*Find and set departmentManager details
            Company.filter(
              (option: any) =>
                option.Id === this.state.requestValues.CompanyDepartmenId
            ).find((option: any) => {
              this.setState({
                requestValues: {
                  ...this.state.requestValues,
                  CompanyDepartmen: option.Title,
                },
              });
              this.setState({
                approvalData: {
                  ...this.state.approvalData,
                  DManagerId: option.DepartmentManagerId,
                  DManagerName: option.DepartmentManagerName,
                  DManagerEmail: option.DepartmentManagerEmail,
                  CompanyDepartmen: option.Role,
                  DManagerSignature:
                    option.DepartmentManagerName +
                    " " +
                    new Date().toLocaleDateString("pt-PT"),
                },
              });
              //*Change the department  is "אחר"
              if (option.Title === "אחר") {
                this.setState({
                  ComapnyManagerDisabled: true,
                });
              }
            });
          });
      });

    this.setState({
      IsLoading: false,
    });
  };

  //* on onSubmit
  onSubmitHandler = (event: any) => {
    event.preventDefault();
    try {
      this.sp.web.lists
        .getByTitle("VacationRequests")
        .items.getById(this.state.requestValues.Id)
        .update({
          ApprovalsId: this.state.requestValues.DepartmentManagerId,
          StatusRequest: this.state.statusRequest,
          DManager: this.state.approvalData.approvalDManagerStatus,
          CManager: this.state.approvalData.approvalManagerStatus,
          DManagerRemarks: this.state.approvalData.DManagerRemarks,
          ManagerRemarks: this.state.approvalData.ManagerRemarks,
        })
        .catch((error) => console.log(error))
        .then(() => (window.location.href = Constants.ListView));
    } catch (error) {
      console.log(error);
    }
  };

  //* go back to the list
  onCancleHandler = async () => {
    window.location.href = Constants.ListView;
  };

  //* sweet alert
  PopOverToggle = () => {
    this.setState({
      popoverOpen: !this.state.popoverOpen,
    });
  };

  public render(): React.ReactElement<IEditVacationRequestProps> {
    //*Change the current state of the requestValue <= CompanyDepartmen and departmentManagerEmail
    const CompanyDepartmentHandler = (e: any) => {
      if (e.target.innerText) {
        const department = this.state.CompanyDepartments.find(
          (company: any) => company.Title === e.target.innerText
        );
        this.setState({
          requestValues: {
            ...this.state.requestValues,
            CompanyDepartmenId: department.Id,
            CompanyDepartmen: department.Title,
            DepartmentManagerId: department.DepartmentManagerId,
          },
        });
      }
    };

    //*Change the current state of the approvalData <= approvalDManagerStatus
    const approvalDManagerStatusChange = (e: any) => {
      switch (e.target.innerText) {
        case "מאשר":
          this.setState({
            statusRequest: "בתהליך...",
            ComapnyManagerDisabled: true,
            approvalData: {
              ...this.state.approvalData,
              approvalDManagerStatus: e.target.innerText,
            },
          });
          break;
        case "לא מאשר":
          this.setState({
            statusRequest: "לא מאשר",
            ComapnyManagerDisabled: true,
            approvalData: {
              ...this.state.approvalData,
              approvalDManagerStatus: e.target.innerText,
            },
          });
          break;
        case "בחר":
          this.setState({
            statusRequest: "בתהליך...",
            approvalData: {
              ...this.state.approvalData,
              approvalDManagerStatus: "בחר",
            },
          });
          break;
      }
    };
    //*Change the current state of the approvalData <= approvalManagerStatus
    const approvalManagerStatusChange = (e: any) => {
      switch (e.target.innerText) {
        case "מאשר":
          this.setState({
            statusRequest: "מאשר",
            approvalData: {
              ...this.state.approvalData,
              approvalManagerStatus: e.target.innerText,
            },
          });
          break;
        case "לא מאשר":
          this.setState({
            statusRequest: "לא מאשר",
            approvalData: {
              ...this.state.approvalData,
              approvalManagerStatus: e.target.innerText,
            },
          });
          break;
        case "בחר":
          this.setState({
            statusRequest: "בתהליך...",
            approvalData: {
              ...this.state.approvalData,
              approvalManagerStatus: "בחר",
            },
          });
          break;
      }
    };
    //*Change the current state of the approvalData <= DManagerRemarks
    const DManagerRemarksChange = (e: any) => {
      this.setState({
        approvalData: {
          ...this.state.approvalData,
          DManagerRemarks: e.target.value,
        },
      });
    };
    // //*Change the current state of the approvalData <= ManagerRemarks
    const ManagerRemarksChange = (e: any) => {
      this.setState({
        approvalData: {
          ...this.state.approvalData,
          ManagerRemarks: e.target.value,
        },
      });
    };

    return (
      <div className={styles.NewRequest} dir="rtl">
        <CacheProvider value={this.cacheRtl}>
          <div className="EONewFormContainer">
            <div className="EOHeader">
              <div className="EOHeaderContainer">
                <span className="EOHeaderText">עריכה בקשה לחופשה</span>
              </div>
              <div className="EOLogoContainer"></div>
            </div>
            {this.state.IsLoading && (
              <div className="SpinnerComp">
                <div className="loading-screen">
                  <div className="loader-wrap">
                    <span className="loader-animation"></span>
                    <div className="loading-text">
                      <span className="letter">ב</span>
                      <span className="letter">ט</span>
                      <span className="letter">ע</span>
                      <span className="letter">י</span>
                      <span className="letter">נ</span>
                      <span className="letter">ה</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={this.onSubmitHandler}>
              <Row className="mt-4">
                {" "}
                <Col xs={3}>
                  <p>שם העובד:</p>
                </Col>
                <Col xs={9}>
                  <PeoplePicker
                    disabled
                    context={this.props.context}
                    personSelectionLimit={1}
                    showtooltip={true}
                    styles={this._styles}
                    defaultSelectedUsers={[this.state.requestValues.user.Title]}
                    showHiddenInUI={false}
                    principalTypes={[PrincipalType.User]}
                    resolveDelay={1000}
                  />
                </Col>
              </Row>
              <Row className="mt-4">
                <Col xs={3}>
                  {" "}
                  <p>תאריך הבקשה:</p>
                </Col>
                <Col xs={9}>
                  {" "}
                  <MuiPickersUtilsProvider utils={DateFnsUtils} locale={he}>
                    <KeyboardDatePicker
                      variant="inline"
                      format="dd/MM/yyyy"
                      id="Date Picker"
                      onChange={null}
                      readOnly
                      disabled
                      value={this.state.requestValues.RequestDate}
                      className="inputText"
                      style={{
                        marginLeft: 5,
                      }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                      InputProps={{
                        style: {
                          fontSize: 16,
                          height: 30,
                          width: "200px",
                        },
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </Col>
              </Row>
              <Row className="mt-4">
                <Col xs={3}>
                  {" "}
                  <p>מחלקה:</p>
                </Col>
                <Col xs={9}>
                  {" "}
                  <div className="box">
                    <Autocomplete
                      id="CompanyDepartments"
                      className="inputText"
                      style={{ direction: "rtl" }}
                      onChange={CompanyDepartmentHandler}
                      value={this.state.requestValues.CompanyDepartmen}
                      disabled
                      options={[""]}
                      renderInput={(params) => (
                        <TextField
                          style={{ padding: 0, textAlign: "center" }}
                          variant="outlined"
                          {...params}
                        />
                      )}
                    />
                  </div>
                </Col>
              </Row>
              <Row className="mt-4">
                <Col xs={3}>
                  <p>תאריכים:</p>
                </Col>
                <Col xs={3}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils} locale={he}>
                    <KeyboardDatePicker
                      variant="inline"
                      format="dd/MM/yyyy"
                      id="Date Picker"
                      placeholder="מתאריך"
                      disabled
                      value={this.state.requestValues.FromDate}
                      autoOk={true}
                      onChange={console.log}
                      style={{
                        width: 150,
                        marginLeft: 5,
                      }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                      InputProps={{
                        style: {
                          fontSize: 16,
                          height: 30,
                          width: "200px",
                        },
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </Col>
                <Col xs={3}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils} locale={he}>
                    <KeyboardDatePicker
                      variant="inline"
                      format="dd/MM/yyyy"
                      placeholder="עד תאריך"
                      id="FromDate"
                      disabled
                      value={this.state.requestValues.ToDate}
                      autoOk={true}
                      onChange={console.log}
                      style={{
                        width: 150,
                        marginLeft: 5,
                      }}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                      InputProps={{
                        style: {
                          fontSize: 16,
                          height: 30,
                          width: "200px",
                        },
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </Col>
              </Row>
              {this.state.isFutuerData && (
                <Alert color="danger">נא לבחור תאריך עתידי</Alert>
              )}
              {this.state.isBiggerThenStartData && (
                <Alert color="danger">התאריך חייב להיות גדול ממתאריך</Alert>
              )}
              <Row className="mt-4">
                <Col xs={3}>
                  {" "}
                  <p>מספר ימי חופשה בפועל:</p>
                </Col>
                <Col xs={9}>
                  {" "}
                  <TextField
                    disabled
                    className="inputText"
                    InputProps={{ inputProps: { min: 0 } }}
                    value={this.state.requestValues.numberOfDays}
                    type="number"
                  ></TextField>
                </Col>
              </Row>
              <Row className="mt-4">
                <Col xs={3}>
                  {" "}
                  <p>האם נותרו לי ימי חופשה?</p>
                </Col>
                <Col xs={9}>
                  {" "}
                  <div className="box">
                    <Autocomplete
                      id="haveVacationDays"
                      className="inputText"
                      style={{ direction: "rtl" }}
                      options={["כן", "לא", "לא יודע"]}
                      disabled
                      value={this.state.requestValues.haveVacationDays}
                      renderInput={(params) => (
                        <TextField
                          required
                          style={{ padding: 0, textAlign: "center" }}
                          variant="outlined"
                          {...params}
                        />
                      )}
                    />
                  </div>
                </Col>
              </Row>{" "}
              {this.state.requestValues.haveVacationDays === "לא יודע" && (
                <Row className="mt-3 justify-content-start">
                  <Col xs={3}></Col>
                  <Col xs={9}>
                    <FormControlLabel
                      value={this.state.isPolicyVacationChacke}
                      control={<Checkbox />}
                      checked
                      disabled
                      label="אני מאשר/ת בזה לחברה שאם אין לי די ימי חופשה צבורה החברה
                      תוכל לקזז את החופשה שתאושר משכרי"
                      labelPlacement="end"
                    />
                  </Col>
                </Row>
              )}
              <Row className="mt-3 justify-content-center">
                {this.state.isPolicyVacationChacke && (
                  <Col xs={5}>
                    <Alert className="text-center" color="danger">
                      נא לסמן את האישור
                    </Alert>
                  </Col>
                )}
              </Row>
              {this.state.requestValues.CompanyDepartmenId === 1 && (
                <Row className="mt-3">
                  <Col xs={3}>
                    <p>האם היציאה לחופשה מתקיימת בזמן פרויקט פעיל?</p>
                  </Col>
                  <Col xs={9}>
                    {" "}
                    <div className="box">
                      <Autocomplete
                        className="mt-2 inputText"
                        id="haveVacationDays"
                        style={{ direction: "rtl" }}
                        options={["כן", "לא", "לא יודע", "אחר"]}
                        disabled
                        value={
                          this.state.requestValues.vacationDuringActiveProject
                        }
                        renderInput={(params) => (
                          <TextField
                            style={{ padding: 0, textAlign: "center" }}
                            variant="outlined"
                            {...params}
                          />
                        )}
                      />
                    </div>
                  </Col>
                </Row>
              )}
              {this.state.requestValues.vacationDuringActiveProject === "אחר" &&
                this.state.requestValues.CompanyDepartmenId === 1 && (
                  <Row>
                    <Col xs={3}></Col>
                    <Col xs={9} style={{ padding: "0px" }}>
                      <Box
                        component="form"
                        sx={{
                          "& .MuiTextField-root": { m: 1, width: "60ch" },
                        }}
                        noValidate
                        autoComplete="off"
                      >
                        <div>
                          <MaterialTextField
                            dir="rtl"
                            id="outlined-multiline-static"
                            label="פרט"
                            disabled
                            value={
                              this.state.requestValues
                                .vacationDuringActiveProjectEX
                            }
                            multiline
                            rows={4}
                          />
                        </div>
                      </Box>
                    </Col>
                  </Row>
                )}
              <Row className="approvalStatusTitle justify-content-right text-center my-5">
                <div className="my-3 py-1">
                  <h4>אישורים</h4>
                </div>
              </Row>
              <Row className="justify-content-center">
                {this.state.statusRequest === "מאשר" ? (
                  <div className="text-center square rounded-pill approvalStatus">
                    {this.state.statusRequest} &nbsp;&nbsp; <AiOutlineCheck />
                  </div>
                ) : this.state.statusRequest === "בתהליך..." ? (
                  <div className="text-center square rounded-pill awaitStatus">
                    {this.state.statusRequest}
                  </div>
                ) : (
                  this.state.statusRequest === "לא מאשר" && (
                    <div className="text-center square rounded-pill rejectStatus">
                      {this.state.statusRequest} &nbsp;&nbsp;
                      <AiOutlineClose />
                    </div>
                  )
                )}
              </Row>
              <Container className="mt-5">
                <div>
                  {this.state.IsManager === "yes" ||
                  this.state.requestValues.CompanyDepartmen === "אחר" ? null : (
                    <div>
                      <Row className="text-center">
                        <Col>שם המאשר</Col>
                        <Col>תפקיד</Col>
                        <Col>אישור</Col>
                        <Col>חתימה</Col>
                        <Col>הערות</Col>
                      </Row>
                      <Row>
                        <Col>
                          <InputGroup>
                            <Input
                              value={this.state.approvalData.DManagerName}
                              className="inputText"
                              disabled
                            />
                          </InputGroup>
                        </Col>
                        <Col>
                          <InputGroup>
                            <Input
                              value={this.state.approvalData.CompanyDepartmen}
                              className="inputText"
                              disabled
                            />
                          </InputGroup>
                        </Col>
                        <Col>
                          <div className="box mt-1">
                            <Autocomplete
                              style={{ direction: "rtl" }}
                              value={
                                this.state.approvalData.approvalDManagerStatus
                              }
                              disabled={
                                this.state.currentUserId !==
                                this.state.approvalData.DManagerId
                              }
                              defaultValue="בחר"
                              options={["לא מאשר", "מאשר", "בחר"]}
                              onChange={approvalDManagerStatusChange}
                              renderInput={(params) => (
                                <TextField
                                  style={{ padding: 0, textAlign: "center" }}
                                  variant="outlined"
                                  {...params}
                                />
                              )}
                            />
                          </div>
                        </Col>
                        <Col>
                          <InputGroup>
                            <Input
                              value={
                                this.state.approvalData
                                  .approvalDManagerStatus === "בחר"
                                  ? ""
                                  : this.state.approvalData.DManagerSignature
                              }
                              className="inputText"
                              disabled
                            />
                          </InputGroup>
                        </Col>
                        <Col>
                          <div>
                            <MaterialTextField
                              onChange={DManagerRemarksChange}
                              disabled={
                                this.state.currentUserId !==
                                this.state.approvalData.DManagerId
                              }
                              dir="rtl"
                              multiline
                              rows={2}
                            />
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <Row className="text-center">
                    <Col>שם המאשר</Col>
                    <Col>תפקיד</Col>
                    <Col>אישור</Col>
                    <Col>חתימה</Col>
                    <Col>הערות</Col>
                  </Row>
                  <Row>
                    <Col>
                      <InputGroup>
                        <Input
                          value={this.state.approvalData.CompanyManagerName}
                          className="inputText"
                          disabled
                        />
                      </InputGroup>
                    </Col>
                    <Col>
                      <InputGroup>
                        <Input value='מנכ"ל' className="inputText" disabled />
                      </InputGroup>
                    </Col>
                    <Col>
                      <div className="box mt-1">
                        <Autocomplete
                          style={{ direction: "rtl" }}
                          value={this.state.approvalData.approvalManagerStatus}
                          disabled={
                            // this.state.ComapnyManagerDisabled &&
                            this.state.currentUserId !==
                            this.state.approvalData.CompanyManagerId
                          }
                          defaultValue="בחר"
                          options={["לא מאשר", "מאשר", "בחר"]}
                          onChange={approvalManagerStatusChange}
                          renderInput={(params) => (
                            <TextField
                              style={{ padding: 0, textAlign: "center" }}
                              variant="outlined"
                              {...params}
                            />
                          )}
                        />
                      </div>
                    </Col>
                    <Col>
                      <InputGroup>
                        <Input
                          value={
                            this.state.approvalData.approvalManagerStatus ===
                            "בחר"
                              ? ""
                              : this.state.approvalData.CompanyManagerSignature
                          }
                          className="inputText"
                          disabled
                        />
                      </InputGroup>
                    </Col>
                    <Col>
                      <div>
                        <MaterialTextField
                          onChange={ManagerRemarksChange}
                          disabled={
                            //  this.state.ComapnyManagerDisabled &&
                            this.state.currentUserId !==
                            this.state.approvalData.CompanyManagerId
                          }
                          dir="rtl"
                          multiline
                          rows={2}
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              </Container>
              <Container className="my-5">
                <Row className="justify-content-md-center">
                  <Col xs={1} className="text-center">
                    <Button
                      variant="contained"
                      id="Popover1"
                      color="error"
                      onClick={this.PopOverToggle}
                      endIcon={<IoCloseCircleOutline />}
                    >
                      ביטול
                    </Button>
                    <Popover
                      flip
                      placement="top"
                      target="Popover1"
                      toggle={this.PopOverToggle}
                      isOpen={this.state.popoverOpen}
                    >
                      <PopoverHeader className="text-center">
                        ?האם אתה בטוח
                      </PopoverHeader>
                      <PopoverBody>
                        <div>
                          {" "}
                          <Button
                            variant="contained"
                            style={{ backgroundColor: "#84C792" }}
                            onClick={this.onCancleHandler}
                          >
                            כן
                          </Button>
                          &nbsp;&nbsp;
                          <Button
                            variant="contained"
                            color="error"
                            onClick={this.PopOverToggle}
                          >
                            לא
                          </Button>
                        </div>
                      </PopoverBody>
                    </Popover>
                  </Col>
                  <Col xs={1} className="text-center">
                    <Button
                      variant="contained"
                      style={{ backgroundColor: "#84C792" }}
                      endIcon={<AiOutlineSend className="RotatedIcon" />}
                      type="submit"
                    >
                      שמירה
                    </Button>
                  </Col>
                </Row>
              </Container>
            </form>
          </div>
        </CacheProvider>
      </div>
    );
  }
}
