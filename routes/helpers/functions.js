const capitalize = (string) => {
  const name = string.toLowerCase().split(' ');

  for (let i = 0; i < name.length; i++) {
    name[i] = name[i][0].toUpperCase() + name[i].substr(1);
  }

  return name.join(' ');
};

module.exports = { capitalize };
