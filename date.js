

module.exports = getDate;

function getDate(){
let day = new Date();
let today = day.getDay();
let options= {
  weekday:"long",
  day:"numeric",
  month:"long"
};
return day.toLocaleDateString("en-US", options);
}
