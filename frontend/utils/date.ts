export function reformatTMDBDate(date: string): string {
  const year = date.substring(0, 4);
  const month = date.substring(5, 7);
  const day = date.substring(8, 10);
  let monthText;

  // prettier-ignore
  switch (month) {
      case "01": monthText = "January"; break;
      case "02": monthText = "February"; break;
      case "03": monthText = "March"; break;
      case "04": monthText = "April"; break;
      case "05": monthText = "May"; break;
      case "06": monthText = "June"; break;
      case "07": monthText = "July"; break;
      case "08": monthText = "August"; break;
      case "09": monthText = "September"; break;
      case "10": monthText = "October"; break;
      case "11": monthText = "November"; break;
      case "12": monthText = "December"; break;
    }

  return `${monthText} ${day}, ${year}`;
}

export function reformatTimestampDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const month = date.getMonth();
  let monthText: string = "";

  // prettier-ignore
  switch (month) {
      case 0: monthText = "January"; break;
      case 1: monthText = "February"; break;
      case 2: monthText = "March"; break;
      case 3: monthText = "April"; break;
      case 4: monthText = "May"; break;
      case 5: monthText = "June"; break;
      case 6: monthText = "July"; break;
      case 7: monthText = "August"; break;
      case 8: monthText = "September"; break;
      case 9: monthText = "October"; break;
      case 10: monthText = "November"; break;
      case 11: monthText = "December"; break;
    }

  return `${monthText} ${date.getDate()}, ${date.getFullYear()}`;

  // return monthText;
}
