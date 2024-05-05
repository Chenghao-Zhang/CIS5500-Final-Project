export function formatMysqlDate(date) {
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);

  return year + "-" + month + "-" + day;
}

export function getCurrentDateFormatted() {
  var currentDate = new Date();
  var formattedDate = formatMysqlDate(currentDate);
  return formattedDate;
}

export function getRandomColor() {
  const randomR = Math.floor(Math.random() * 256);
  const randomG = Math.floor(Math.random() * 256);
  const randomB = Math.floor(Math.random() * 256);
  const colorHex = ((1 << 24) + (randomR << 16) + (randomG << 8) + randomB).toString(16).slice(1);

  return `#${colorHex}`;
}

