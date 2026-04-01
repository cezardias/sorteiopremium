const mysql = require('mysql2/promise');

async function checkLegacyWinners() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'u434605668_sorteiospremiu',
            password: 'SorteiosPremiumMultiMarca1!2#%34.',
            database: 'u434605668_sorteiospremiu'
        });

        const [rows] = await connection.execute('SELECT id, title, winner_id, winner_number FROM rifas WHERE winner_id IS NOT NULL');
        console.log('Rifas with winners:', JSON.stringify(rows, null, 2));

        const [winners] = await connection.execute('SHOW TABLES LIKE "rifas_winners"');
        console.log('rifas_winners table exists:', winners.length > 0);
        
        if (winners.length > 0) {
            const [winnerRows] = await connection.execute('SELECT * FROM rifas_winners');
            console.log('Rows in rifas_winners:', winnerRows.length);
        }

        await connection.end();
    } catch (err) {
        console.error('DB Error:', err.message);
    }
}

checkLegacyWinners();
