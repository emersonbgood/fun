const players = [
    { id: 'bottom', cards: [] }, // You
    { id: 'left', cards: [] },   // Player 2
    { id: 'top', cards: [] },    // Player 3
    { id: 'right', cards: [] }   // Player 4
];

function createCardSVG(color, label, isHidden = false) {
    if (isHidden) {
        return `<svg class="card-svg" viewBox="0 0 100 150">
                    <rect width="100" height="150" rx="10" fill="#222" stroke="white" stroke-width="3"/>
                    <text x="50" y="85" text-anchor="middle" fill="white" font-size="30">UNO</text>
                </svg>`;
    }
    return `
    <svg class="card-svg" viewBox="0 0 100 150">
        <rect width="100" height="150" rx="10" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="50" cy="75" r="40" fill="white" opacity="0.2" />
        <text x="50" y="85" text-anchor="middle" fill="white" font-weight="bold" font-size="35">${label}</text>
    </svg>`;
}

function renderHands() {
    players.forEach(player => {
        const container = document.getElementById(`player-${player.id}`);
        container.innerHTML = '';
        
        player.cards.forEach(card => {
            // Hide opponent cards (id !== 'bottom')
            const svgMarkup = createCardSVG(card.color, card.label, player.id !== 'bottom');
            container.innerHTML += svgMarkup;
        });
    });
}

// Quick test: Deal 7 cards to everyone
const testColors = ['#ff5555', '#55aa55', '#5555ff', '#ffaa00'];
players.forEach(p => {
    for(let i=0; i<7; i++) {
        p.cards.push({ color: testColors[i%4], label: i });
    }
});

renderHands();
