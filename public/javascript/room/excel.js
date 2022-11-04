import { postRequest } from '../helpers/helpers.js';
import { errorMsg } from './msg.js';
import { meetingId } from './room.js';
import { rtm } from './rtc.js';

const attendance = [];

const createExcelAttendance = (data) => {
  const exportBtn = document.getElementById('export_attendance');
  const { meetingId, _id, first_name, last_name } = data;

  if (!attendance.filter((item) => item._id === _id).length > 0)
    attendance.push({ _id, first_name, last_name, activity: 'present' });

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

const getAllUsers = async () => {
  try {
    const users = await rtm.channel.getMembers();
    const url = `/get-all-users-info`;
    const { data, msg, err } = await postRequest(url, users);
    if (err) errorMsg(err);
    console.log(data, msg, err);
  } catch (e) {
    console.log(e);
  }
};

const exportExcelAttendance = async () => {
  await getAllUsers();
  const now = new Date().toISOString();
  const dateNowToUtc = new Date().toUTCString();
  const wb = XLSX.utils.book_new();
  const mapId = attendance.map((user) => ({
    FirstName: user.first_name,
    LastName: user.last_name,
    activity: user.activity,
  }));
  const wk = XLSX.utils.json_to_sheet(mapId, { origin: 'A4' });
  XLSX.utils.sheet_add_aoa(
    wk,
    [
      ['Meeting ID', , 'Date Created'],
      [meetingId, , dateNowToUtc],
    ],
    {
      origin: 'A1',
    }
  );
  XLSX.utils.book_append_sheet(wb, wk, meetingId);
  XLSX.writeFile(wb, `${meetingId}_${now}.xlsx`);
};

export { createExcelAttendance };
