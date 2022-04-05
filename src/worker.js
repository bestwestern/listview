var allData = [];
onmessage = function (e) {
  const { data } = e.data;
  if (data) analyzeData(data);
  console.log("Message received from main script");
  var workerResult = "Result: ";
  postMessage(workerResult);
};
const analyzeData = (data) => {
  console.log(data);
  const { rows, columns } = data;
  if (rows) {
    postMessage(new Set([1, 2]));
  }
};
