

const datasetId = "d_8b84c4ee58e3cfc0ece0d773c8ca6abc";
const url = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId;
let arr = [];
let limit = 1000; // Number of records per page
let offset = 0; // Starting point

async function fetchAllRecords() {
    let hasMoreRecords = true;

    while (hasMoreRecords) {
        let paginatedUrl = `${url}&limit=${limit}&offset=${offset}`;

        try {
            let response = await fetch(paginatedUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            let data = await response.json();

            if (data.result.records.length > 0) {
                arr = arr.concat(data.result.records);
                console.log(offset);
                offset += limit; // Move to the next set of records
            } else {
                hasMoreRecords = false; // No more records to fetch
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            hasMoreRecords = false;
        }
    }

    console.log(arr.length);
    console.log(arr);
}

fetchAllRecords();
