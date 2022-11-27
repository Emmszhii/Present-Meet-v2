const exportExcelFromDb = async (data) => {
  const now = new Date().toISOString();
  const dateNowToUtc = new Date().toUTCString();
  const wb = XLSX.utils.book_new();
  const wk = XLSX.utils.aoa_to_sheet(
    [['Classroom ID', '', 'Date Exported'], [data._id, '', dateNowToUtc], ['']],
    { origin: 'A1' }
  );
  const teacher = [
    {
      FirstName: data.first_name,
      MiddleName: data.middle_name,
      LastName: data.last_name,
    },
    {},
  ];

  const date = data.attendance.map((item) =>
    new Date(item.createdAt).toUTCString()
  );

  XLSX.utils.sheet_add_aoa(wk, [['TEACHER']], { origin: -1 });
  XLSX.utils.sheet_add_json(wk, teacher, {
    origin: -1,
  });
  XLSX.utils.sheet_add_aoa(wk, [['STUDENT(S)']], { origin: -1 });
  XLSX.utils.sheet_add_aoa(
    wk,
    [
      [
        `ID`,
        'FirstName',
        'MiddleName',
        'LastName',
        ...date,
        '',
        'Present',
        'Late',
        'Absent',
      ],
    ],
    { origin: -1 }
  );
  data.students.map((student) => {
    const studentId = student._id;
    const FirstName = student.first_name;
    const MiddleName = student.middle_name;
    const LastName = student.last_name;
    const act = [];
    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    data.attendance.map((item) => {
      let activity;

      if (item.present.includes(studentId)) {
        activity = 'present';
        totalPresent++;
      } else if (item.late.includes(studentId)) {
        activity = 'late';
        totalLate++;
      } else {
        activity = 'absent';
        totalAbsent++;
      }

      act.push(activity);
    });
    XLSX.utils.sheet_add_aoa(
      wk,
      [
        [
          studentId,
          FirstName,
          MiddleName,
          LastName,
          ...act,
          '',
          totalPresent,
          totalLate,
          totalAbsent,
        ],
      ],
      {
        origin: -1,
      }
    );
  });

  XLSX.utils.book_append_sheet(wb, wk, data._id);
  XLSX.writeFile(wb, `${data._id}_${now}.xlsx`);
};

export { exportExcelFromDb };
