var arr = [];
async function fetchSchoolData() {
    const datasetId = "d_688b934f82c1059ed0a6993d2a829089"
    const url = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId;
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json();
      })
      .then(async data => {
        // console.log(data);
    
        // Extract records
        const records = data.result.records;
    
        // Filter to keep only school_name and postal_code
        records.forEach(record => {
          arr.push({
            school_name: record.school_name,
            address : record.address,
            postal_code: record.postal_code,
            level : record.mainlevel_code
          });
        });
        // Print the filtered records
        for (const school of arr) {
            const coordinates = await getCoordinates(school.address);
            if (coordinates) {
                school.latitude = coordinates.latitude;
                school.longitude = coordinates.longitude;
            }else{
                throw new Error('Unknown Error');
            }
        }
        console.log(arr);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
}
async function getCoordinates(address) {
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(address)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const resultsDict = await response.json();

        if (resultsDict.results.length > 0) {
            return {
                latitude: resultsDict.results[0].LATITUDE,
                longitude: resultsDict.results[0].LONGITUDE
            };
        } else {
            return null; // Handle the case where no results are found
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null; // Handle the error appropriately
    }
}

async function main() {
    await fetchSchoolData();
}

main();
