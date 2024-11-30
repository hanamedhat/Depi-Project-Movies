const axios = require('axios');
const movieCache = require('../server')
// Route to fetch movie metadata and rows
exports.getMovies = async (req, res) => {
    const offset = req.query.offset || 0;
    const length = req.query.length || 100;

    try {
        // Fetch metadata for total rows
        const metadataResponse = await axios.get('https://datasets-server.huggingface.co/info?dataset=Pablinho%2Fmovies-dataset&config=default');
        const metadata = metadataResponse.data;

        // Ensure train split is available
        if (!metadata.dataset_info.splits || !metadata.dataset_info.splits.train) {
            return res.status(500).json({ error: 'Train split not found in metadata.' });
        }

        const totalRows = metadata.dataset_info.splits.train.num_examples;

        // Fetch the rows based on offset and length
        const rowsResponse = await axios.get(`https://datasets-server.huggingface.co/rows?dataset=Pablinho%2Fmovies-dataset&config=default&split=train&offset=${offset}&length=${length}`);
        const rows = rowsResponse.data;

        // Return the fetched rows and total number of rows to the frontend
        res.json({
            totalRows: totalRows,
            rows: rows.rows,
        });
      
    } catch (error) {
        console.error('Error fetching movie data:', error);
        res.status(500).json({ error: 'Error fetching movie data.' });
    }
};

