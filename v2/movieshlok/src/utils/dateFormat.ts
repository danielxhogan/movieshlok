// takes in date in the form yyyy-mm-dd
// Converts to Month dd, yyyy

export function formatDate(date: string) {
  const year = date.substring(0, 4);
  const month = date.substring(6, 7);
  const day = date.substring(9, 10);

  let monthText: string;

  // prettier-ignore
  switch (month) {
    case "0": monthText = "January"; break;
    case "1": monthText = "February"; break;
    case "2": monthText = "March"; break;
    case "3": monthText = "April"; break;
    case "4": monthText = "May"; break;
    case "5": monthText = "June"; break;
    case "6": monthText = "July"; break;
    case "7": monthText = "August"; break;
    case "8": monthText = "September"; break;
    case "9": monthText = "October"; break;
    case "10": monthText = "November"; break;
    case "11": monthText = "December"; break;
    default: monthText = ""
  }

  return `${monthText} ${day}, ${year}`;
}
