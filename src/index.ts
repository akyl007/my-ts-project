import axios from 'axios';

interface CryptoPair {
    symbol: string;
    price: number;
}

async function fetchCryptoPrices(): Promise<CryptoPair[]> {
    const apiUrl = 'https://api.binance.com/api/v3/ticker/price';
    try {
        const response = await axios.get(apiUrl);
        if (response.status !== 200 || !Array.isArray(response.data)) {
            throw new Error('Unexpected response from Binance API');
        }

        return response.data.map((item: { symbol: string; price: string }) => ({
            symbol: item.symbol,
            price: parseFloat(item.price),
        }));
    } catch (error) {
        const err = error as Error;
        console.error('Error fetching crypto prices:', err.message);
        throw new Error('Failed to fetch data from Binance API');
    }
}

function getTopPairs(pairs: CryptoPair[], count: number, order: 'asc' | 'desc'): CryptoPair[] {
    const sortedPairs = [...pairs].sort((a, b) =>
        order === 'asc' ? a.price - b.price : b.price - a.price
    );
    return sortedPairs.slice(0, count);
}

function calculateAveragePrice(pairs: CryptoPair[]): number {
    const total = pairs.reduce((sum, pair) => sum + pair.price, 0);
    return total / pairs.length;
}

async function main() {
    try {
        console.log('Fetching cryptocurrency prices...');
        const cryptoPairs = await fetchCryptoPrices();

        console.log('Calculating top pairs and average price...');
        const top5Expensive = getTopPairs(cryptoPairs, 5, 'desc');
        const top5Cheap = getTopPairs(cryptoPairs, 5, 'asc');
        const averagePrice = calculateAveragePrice(cryptoPairs);

        console.log('\nTop 5 most expensive pairs:');
        top5Expensive.forEach(pair =>
            console.log(`${pair.symbol}: $${pair.price.toFixed(2)}`)
        );

        console.log('\nTop 5 cheapest pairs:');
        top5Cheap.forEach(pair =>
            console.log(`${pair.symbol}: $${pair.price.toFixed(2)}`)
        );

        console.log(`\nAverage price of all pairs: $${averagePrice.toFixed(2)}`);
    } catch (error) {
        const err = error as Error;
        console.error('An error occurred:', err.message);
    }
}

main();
