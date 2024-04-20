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