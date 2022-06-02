// function stringToDate(_date, _format) {
//   var _delimiter = _format.match(/\W/g)[0];
//   var formatLowerCase = _format.toLowerCase();
//   var formatItems = formatLowerCase.split(_delimiter);
//   var dateItems = _date.split(_delimiter);
//   var monthIndex = formatItems.indexOf("mm");
//   var dayIndex = formatItems.indexOf("dd");
//   var yearIndex = formatItems.indexOf("yyyy");
//   var month = parseInt(dateItems[monthIndex]);
//   month -= 1;
//   var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
//   return formatedDate;
// }
function dateToString(_date: Date, format: string) {
  const d = _date.getDate();
  const dd = ("0" + d).slice(-2);
  const m = _date.getMonth() + 1;
  const mm = ("0" + m).slice(-2);
  const yyyy = _date.getFullYear();
  const yy = yyyy.toString().slice(-2);
  return format
    .replace("dd", dd)
    .replace("d", d.toString())
    .replace("mm", mm)
    .replace("m", m.toString())
    .replace("yyyy", yyyy.toString())
    .replace("yy", yy);
}
export { dateToString };
