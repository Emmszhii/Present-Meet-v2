import { meetingId } from './room.js';

const attendance = [];

const createExcelAttendance = (data) => {
  const exportBtn = document.getElementById('export_attendance');
  const { meetingId, first_name: FirstName, last_name: LastName } = data;
  attendance.push({ FirstName, LastName });

  if (!exportBtn) {
    document
      .getElementById('settings_attendance')
      .insertAdjacentHTML('beforeend', domExportAttendanceBtn());

    document
      .getElementById('export_attendance')
      .addEventListener('click', exportExcelAttendance);
  }
};

const domExportAttendanceBtn = () => {
  return `
    <div class='form-group'>
      <button class="button-box" id="export_attendance">Export File</button>
    </div>
  `;
};

const exportExcelAttendance = () => {
  const now = new Date().toISOString();
  const wb = XLSX.utils.book_new();
  const wk = XLSX.utils.json_to_sheet(attendance);
  XLSX.utils.book_append_sheet(wb, wk, meetingId);
  XLSX.writeFile(wb, `${meetingId}_${now}.xlsx`);
};

export { createExcelAttendance };
