//-------------------------------
// еСайн
//-------------------------------
function setDataForESIGN() {
  debugger;
  var regDate = EdocsApi.getAttributeValue("RegDate").value;
  var regNumber = EdocsApi.getAttributeValue("RegNumber").value;
  var name =
    "№" +
    (regNumber ? regNumber : CurrentDocument.id) +
    (!regDate ? "" : " від " + moment(regDate).format("DD.MM.YYYY"));
  doc = {
    docName: name,
    extSysDocId: CurrentDocument.id,
    ExtSysDocVersion: CurrentDocument.version,
    docType: "commissionDecision",
    parties: [
      {
        taskType: "ToSign",
        taskState: "Done",
        legalEntityCode: EdocsApi.getAttributeValue("OrgEDRPOU").value,
        contactPersonEmail: EdocsApi.getEmployeeDataByEmployeeID(
          CurrentDocument.initiatorId
        ).email,
        signatures: [],
      },
      {
        taskType: "toReadWithApprove”",
        taskState: "NotAssigned",
        legalEntityCode: EdocsApi.getAttributeValue("EmployeeEmail").value,
        contactPersonEmail: EdocsApi.getAttributeValue("EmployeeEmail").value,
        expectedSignatures: [],
      },
    ],
    sendingSettings: {
      attachFiles: "fixed",
      attachSignatures: "signatureAndStamp",
    },
  };
  EdocsApi.setAttributeValue({ code: "LSDJSON", value: JSON.stringify(doc) });
}

function onTaskExecuteSendOutDoc(routeStage) {
  debugger;
  if (routeStage.executionResult != "rejected") {
    setDataForESIGN();

    var methodData = {
      extSysDocId: CurrentDocument.id,
      ExtSysDocVersion: CurrentDocument.version,
    };
    routeStage.externalAPIExecutingParams = {
      externalSystemCode: "ESIGN",
      externalSystemMethod: "integration/importDoc",
      data: methodData,
      executeAsync: true,
    };
  }
}

function onTaskCommentedSendOutDoc(caseTaskComment) {
  //debugger;
  var orgCode = EdocsApi.getAttributeValue("OrgEDRPOU").value;
  var orgShortName = EdocsApi.getAttributeValue("OrgName").value;
  if (!orgCode || !orgShortName) {
    return;
  }
  var isCaceling =
    caseTaskComment.comment &&
    caseTaskComment.comment.toLowerCase().startsWith("#cancel#");
  if (isCaceling) {
    caseTaskComment.comment = caseTaskComment.comment.slice(8);
  }
  var methodData = {
    extSysDocId: CurrentDocument.id,
    // extSysDocVersion: CurrentDocument.version,
    eventType: isCaceling ? "CancelProcessing" : "CommentAdded",
    comment: caseTaskComment.comment,
    partyCode: orgCode,
    userTitle: CurrentUser.name,
    partyName: orgShortName,
    occuredAt: new Date(),
  };
  caseTaskComment.externalAPIExecutingParams = {
    externalSystemCode: "ESIGN",
    externalSystemMethod: "integration/processEvent",
    data: methodData,
    executeAsync: true,
  };
}
