const attendance = [];

const createExcelAttendance = (data) => {
  const now = new Date().toISOString();
  const { meetingId, first_name: FirstName, last_name: LastName } = data;
  attendance.push({ FirstName, LastName });
  const wb = XLSX.utils.book_new();
  const wk = XLSX.utils.json_to_sheet(attendance);
  XLSX.utils.book_append_sheet(wb, wk, meetingId);
  XLSX.writeFile(wb, `${meetingId}_${now}.xlsx`);
};

export { createExcelAttendance };
