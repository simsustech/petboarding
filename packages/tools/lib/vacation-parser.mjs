import fetch from "node-fetch";

const url =
  "https://opendata.rijksoverheid.nl/v1/sources/rijksoverheid/infotypes/schoolholidays?output=json";

const vacations = [];

fetch(url)
  .then((res) => res.json())
  .then((res) => {
    console.log(res);
    for (const year of res) {
      for (const content of year.content) {
        for (const vacation of content.vacations) {
          const name = vacation.type.replace(/\s+/g, "");
          for (const region of vacation.regions) {
            if (vacation.regions.length > 1 && region.region === "zuid") {
              if (name === "Zomervakantie") {
                vacations.push({
                  name: "Zomervakantie",
                  start_date: `${new Date(
                    region.startdate
                  ).getFullYear()}-07-01`,
                  end_date: `${new Date(region.startdate).getFullYear()}-08-31`,
                });
              } else {
                vacations.push({
                  name: name,
                  start_date: region.startdate.substring(0, 10),
                  end_date: region.enddate.substring(0, 10),
                });
              }
            } else if (vacation.regions.length === 1) {
              vacations.push({
                name: name,
                start_date: region.startdate.substring(0, 10),
                end_date: region.enddate.substring(0, 10),
              });
            }
          }
        }
      }
    }
  })
  .then((res) => console.log(vacations));
