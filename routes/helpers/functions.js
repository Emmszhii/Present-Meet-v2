const capitalize = (string) => {
  const name = string.toLowerCase().split(' ');

  for (let i = 0; i < name.length; i++) {
    const exist = name[i][0];

    if (exist) name[i] = name[i][0].toUpperCase() + name[i].substr(1);
  }

  return name.join(' ').trim();
};

module.exports = { capitalize };
