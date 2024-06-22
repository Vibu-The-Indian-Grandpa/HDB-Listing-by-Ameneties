const datasetId = "d_688b934f82c1059ed0a6993d2a829089"
const url = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId;

let arr = [];

fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return response.json();
  })
  .then(data => {
    // console.log(data);

    // Extract records
    const records = data.result.records;

    // Filter to keep only school_name and postal_code
    records.forEach(record => {
      arr.push({
        school_name: record.school_name,
        address : record.address,
        postal_code: record.postal_code,
        level: record.mainlevel_code
      });
    });
    // Print the filtered records
    console.log(arr);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });