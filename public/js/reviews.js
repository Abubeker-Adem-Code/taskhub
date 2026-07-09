export async function initializeReviewsFeed() {
    const container = document.getElementById('reviews-feed-container');
    if (!container) return;

    try {
        const response = await apiWrapper.get('/api/reviews');
        
        if (!response || response.length === 0) {
            container.innerHTML = `<div class="feed-empty">No reviews published yet. Be the first!</div>`;
            return;
        }

        container.innerHTML = '';
        container.removeAttribute('data-loading');

        response.forEach(review => {
            const card = document.createElement('div');
            card.className = 'review-card';
            card.innerHTML = `
                <div class="review-meta">
                    <span class="review-author">${escapeHTML(review.authorName)}</span>
                    <span class="review-role role-${review.role.toLowerCase()}">${review.role}</span>
                </div>
                <div class="review-rating" aria-label="Rating: ${review.rating} out of 5 stars">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                </div>
                <p class="review-body">"${escapeHTML(review.comment)}"</p>
                <div class="review-timestamp">${new Date(review.createdAt).toLocaleDateString()}</div>
            `;
            
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Failed to resolve feedback feed:', error);
        container.innerHTML = `
            <div class="feed-error">
                <p>Unable to sync community reviews right now.</p>
                <button onclick="window.location.reload()" class="btn btn-retry">Retry Synchronize</button>
            </div>
        `;
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#/' || window.location.hash === '') {
        initializeReviewsFeed();
    }
});
