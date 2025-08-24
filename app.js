// ===== المتغيرات العامة =====
const movieCards = document.querySelectorAll('.movie-card');
const movieDetailsModal = document.getElementById('movieDetailsModal');
const closeModalBtn = document.querySelector('.close-modal');
const themeToggleBtn = document.querySelector('.theme-toggle');
const body = document.body;

// ===== بيانات الأفلام =====
// بيانات مؤقتة حتى يتم تحميل البيانات من الموقع
let moviesData = [
    {
        id: 1,
        title: "جاري تحميل الأفلام...",
        year: 2023,
        rating: 0,
        duration: "0 دقيقة",
        genres: ["جاري التحميل"],
        description: "جاري تحميل بيانات الأفلام من موقع فاصل إعلاني...",
        poster: "https://via.placeholder.com/300x450?text=جاري+التحميل",
        backdrop: "https://via.placeholder.com/1200x500?text=جاري+التحميل"
    }
];

// ===== وظيفة جلب الأفلام من موقع فاصل إعلاني =====
async function fetchMoviesFromFaselHD() {
    try {
        // التحقق من وجود بيانات مخزنة وعمرها أقل من ساعة
        const cachedData = localStorage.getItem('cachedMovies');
        const cachedTime = localStorage.getItem('cachedMoviesTime');
        const currentTime = new Date().getTime();
        
        // إذا كانت البيانات المخزنة حديثة (أقل من ساعة)، استخدمها
        if (cachedData && cachedTime && (currentTime - parseInt(cachedTime) < 3600000)) {
            console.log('استخدام البيانات المخزنة محليًا (أقل من ساعة)');
            moviesData = JSON.parse(cachedData);
            renderMovies(moviesData);
            updateFeaturedMovie(moviesData[0]);
            return;
        }
        
        // استخدام CORS proxy لتجاوز قيود الأمان - تجربة عدة خيارات
        const corsProxies = [
            'https://corsproxy.io/?',
            'https://api.allorigins.win/raw?url=',
            'https://cors-anywhere.herokuapp.com/'
        ];
        
        // اختيار CORS proxy
        const corsProxy = corsProxies[0];
        const faselHDUrl = 'https://www.faselhds.life/';
        
        // عرض رسالة تحميل
        console.log('جاري تحميل الأفلام من موقع فاصل إعلاني...');
        
        // جلب محتوى الصفحة
        const response = await fetch(corsProxy + encodeURIComponent(faselHDUrl));
        const html = await response.text();
        
        // إنشاء DOM parser لتحليل HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // استخراج بيانات الأفلام من الصفحة - تحسين الاستعلام ليناسب هيكل موقع فاصل إعلاني
        // استهداف جميع العناصر المحتملة التي قد تحتوي على أفلام
        const movieElements = doc.querySelectorAll(
            '.col-xl-2, .col-lg-3, .col-md-4, .col-sm-6, .postDiv, ' +
            '.movie-box, .movie-item, .movie-card, .movie, .post, ' +
            '.item, .box, .card, [class*="movie"], [class*="post"], ' +
            '[class*="film"], [class*="series"], [class*="episode"]'
        );
        
        console.log(`تم العثور على ${movieElements.length} عنصر محتمل`);
        
        // تحويل العناصر إلى مصفوفة من بيانات الأفلام
        const movies = [];
        
        movieElements.forEach((element, index) => {
            try {
                // التحقق من أن العنصر يحتوي على معلومات فيلم
                // البحث عن عنوان الفيلم في عدة أماكن محتملة
                const titleSelectors = [
                    '.h1', 'h1', '.h2', 'h2', '.h3', 'h3', '.title', '.name',
                    '.movie-title', '.post-title', '.entry-title', '.film-title',
                    'a[title]', '[data-title]', '[aria-label]'
                ];
                
                let titleElement = null;
                for (const selector of titleSelectors) {
                    titleElement = element.querySelector(selector);
                    if (titleElement) break;
                }
                
                if (!titleElement) {
                    // محاولة العثور على العنصر الأول الذي يحتوي على نص
                    const allElements = element.querySelectorAll('*');
                    for (const el of allElements) {
                        if (el.textContent && el.textContent.trim().length > 0 && 
                            !['script', 'style'].includes(el.tagName.toLowerCase())) {
                            titleElement = el;
                            break;
                        }
                    }
                    
                    if (!titleElement) return;
                }
                
                // استخراج العنوان
                let title = '';
                if (titleElement.hasAttribute('title')) {
                    title = titleElement.getAttribute('title');
                } else if (titleElement.hasAttribute('data-title')) {
                    title = titleElement.getAttribute('data-title');
                } else if (titleElement.hasAttribute('aria-label')) {
                    title = titleElement.getAttribute('aria-label');
                } else {
                    title = titleElement.textContent;
                }
                
                title = title.trim();
                
                // تجاهل العناصر التي ليست أفلامًا
                if (!title || title.length < 2) return;
                
                // استخراج التقييم
                const ratingSelectors = [
                    '.rating', '.imdb', '.rate', '.score', '.stars',
                    '[data-rating]', '[data-score]', '[data-stars]'
                ];
                
                let ratingElement = null;
                for (const selector of ratingSelectors) {
                    ratingElement = element.querySelector(selector);
                    if (ratingElement) break;
                }
                
                let rating = 0;
                if (ratingElement) {
                    const ratingText = ratingElement.textContent.trim();
                    const ratingMatch = ratingText.match(/\d+(\.\d+)?/);
                    rating = ratingMatch ? parseFloat(ratingMatch[0]) : 0;
                    
                    // تحويل التقييم إلى مقياس من 10 إذا كان أقل من 5
                    if (rating > 0 && rating <= 5) {
                        rating = rating * 2;
                    }
                }
                
                // استخراج الصورة
                const posterSelectors = [
                    'img', '.poster', '.thumbnail', '.image', '.movie-image',
                    '.post-image', '.entry-image', '.film-image'
                ];
                
                let posterElement = null;
                for (const selector of posterSelectors) {
                    posterElement = element.querySelector(selector);
                    if (posterElement) break;
                }
                
                let poster = 'https://via.placeholder.com/300x450?text=No+Image';
                if (posterElement) {
                    // محاولة العثور على الصورة في عدة سمات
                    const srcAttributes = ['src', 'data-src', 'data-lazy-src', 'data-original', 'data-image'];
                    for (const attr of srcAttributes) {
                        if (posterElement.hasAttribute(attr)) {
                            const srcValue = posterElement.getAttribute(attr);
                            if (srcValue && srcValue.trim() !== '') {
                                poster = srcValue;
                                break;
                            }
                        }
                    }
                    
                    // التحقق من أن الرابط مطلق
                    if (poster && !poster.startsWith('http')) {
                        if (poster.startsWith('//')) {
                            poster = 'https:' + poster;
                        } else if (poster.startsWith('/')) {
                            poster = 'https://www.faselhds.life' + poster;
                        }
                    }
                }
                
                // استخراج الرابط للحصول على مزيد من المعلومات
                const linkSelectors = ['a', '.link', '.more', '.details', '.watch'];
                
                let linkElement = null;
                for (const selector of linkSelectors) {
                    linkElement = element.querySelector(selector);
                    if (linkElement) break;
                }
                
                let link = '';
                if (linkElement && linkElement.hasAttribute('href')) {
                    link = linkElement.getAttribute('href');
                    
                    // التحقق من أن الرابط مطلق
                    if (link && !link.startsWith('http')) {
                        if (link.startsWith('//')) {
                            link = 'https:' + link;
                        } else if (link.startsWith('/')) {
                            link = 'https://www.faselhds.life' + link;
                        }
                    }
                }
                
                if (!link) {
                    link = `https://www.faselhds.life/search?s=${encodeURIComponent(title)}`;
                }
                
                // استخراج السنة (إذا وجدت)
                const yearSelectors = ['.year', '.date', '.release', '.time', '[data-year]'];
                
                let yearElement = null;
                for (const selector of yearSelectors) {
                    yearElement = element.querySelector(selector);
                    if (yearElement) break;
                }
                
                let year = new Date().getFullYear();
                if (yearElement) {
                    const yearText = yearElement.textContent;
                    const yearMatch = yearText.match(/\d{4}/);
                    if (yearMatch) {
                        year = parseInt(yearMatch[0]);
                    }
                }
                
                // استخراج التصنيفات (إذا وجدت)
                const genreSelectors = [
                    '.genre', '.category', '.type', '.tag', '.genres',
                    '[data-genre]', '[data-category]', '[data-type]'
                ];
                
                const genreElements = [];
                for (const selector of genreSelectors) {
                    const elements = element.querySelectorAll(selector);
                    if (elements.length > 0) {
                        genreElements.push(...elements);
                    }
                }
                
                const genres = Array.from(genreElements)
                    .map(el => el.textContent.trim())
                    .filter(text => text.length > 0);
                
                // إنشاء كائن الفيلم
                movies.push({
                    id: index + 1,
                    title: title,
                    year: year,
                    rating: rating || Math.floor(Math.random() * 3) + 7, // تقييم افتراضي إذا لم يكن متوفرًا
                    duration: `${Math.floor(Math.random() * 60) + 90} دقيقة`, // مدة افتراضية
                    genres: genres.length > 0 ? genres : ["دراما", "أكشن"],
                    description: `مشاهدة وتحميل ${title} مترجم اون لاين بجودة عالية على موقع فاصل إعلاني.`,
                    poster: poster,
                    backdrop: poster,
                    link: link,
                    watchUrl: link,
                    downloadUrl: `${link}#download`
                });
            } catch (elementError) {
                console.error('خطأ في معالجة عنصر الفيلم:', elementError);
            }
        });
        
        // تحديث بيانات الأفلام
        if (movies.length > 0) {
            moviesData = movies;
            console.log(`تم تحميل ${movies.length} فيلم من موقع فاصل إعلاني`);
            
            // تحديث واجهة المستخدم
            renderMovies(moviesData);
            updateFeaturedMovie(moviesData[0]);
            
            // حفظ البيانات في التخزين المحلي للاستخدام في حالة فشل الاتصال لاحقًا
            localStorage.setItem('cachedMovies', JSON.stringify(moviesData));
            localStorage.setItem('cachedMoviesTime', currentTime.toString());
        } else {
            console.error('لم يتم العثور على أفلام في الصفحة');
            
            // محاولة استرداد البيانات المخزنة مسبقًا
            const cachedMovies = localStorage.getItem('cachedMovies');
            if (cachedMovies) {
                moviesData = JSON.parse(cachedMovies);
                console.log('تم استرداد الأفلام من التخزين المحلي');
                renderMovies(moviesData);
                updateFeaturedMovie(moviesData[0]);
            }
        }
    } catch (error) {
        console.error('حدث خطأ أثناء جلب الأفلام:', error);
        
        // محاولة استرداد البيانات المخزنة مسبقًا
        const cachedMovies = localStorage.getItem('cachedMovies');
        if (cachedMovies) {
            moviesData = JSON.parse(cachedMovies);
            console.log('تم استرداد الأفلام من التخزين المحلي');
            renderMovies(moviesData);
            updateFeaturedMovie(moviesData[0]);
        } else {
            alert('حدث خطأ أثناء جلب الأفلام من موقع فاصل إعلاني. يرجى المحاولة مرة أخرى لاحقًا.');
        }
    }
}

// ===== وظائف التطبيق =====

// فتح نافذة تفاصيل الفيلم
function openMovieDetails(movieId) {
    const movie = moviesData.find(m => m.id === movieId);
    if (!movie) return;
    
    // تحديث محتوى النافذة
    const modalContent = movieDetailsModal.querySelector('.modal-content');
    
    // تحديث الصور
    modalContent.querySelector('.movie-backdrop').src = movie.backdrop;
    modalContent.querySelector('.movie-poster-large img').src = movie.poster;
    
    // تحديث المعلومات الأساسية
    modalContent.querySelector('.movie-header-info h2').textContent = movie.title;
    modalContent.querySelector('.movie-meta .year').textContent = movie.year;
    modalContent.querySelector('.movie-meta .duration').textContent = movie.duration;
    modalContent.querySelector('.movie-meta .rating').innerHTML = `<i class="fas fa-star"></i> ${movie.rating}`;
    
    // تحديث التصنيفات
    const genresContainer = modalContent.querySelector('.genres');
    genresContainer.innerHTML = '';
    movie.genres.forEach(genre => {
        const genreSpan = document.createElement('span');
        genreSpan.className = 'genre';
        genreSpan.textContent = genre;
        genresContainer.appendChild(genreSpan);
    });
    
    // تحديث الوصف
    modalContent.querySelector('.movie-description p').textContent = movie.description;
    
    // إضافة روابط المشاهدة والتحميل
     const watchButton = modalContent.querySelector('.watch-btn');
     const downloadButton = modalContent.querySelector('.download-btn');
     
     if (watchButton) {
         if (movie.watchUrl && movie.watchUrl !== '#') {
             watchButton.href = movie.watchUrl;
             watchButton.target = '_blank';
             watchButton.style.display = 'inline-block';
         } else {
             watchButton.href = 'https://www.faselhds.life/search?s=' + encodeURIComponent(movie.title);
             watchButton.target = '_blank';
             watchButton.style.display = 'inline-block';
         }
     }
     
     if (downloadButton) {
         if (movie.downloadUrl && movie.downloadUrl !== '#') {
             downloadButton.href = movie.downloadUrl;
             downloadButton.target = '_blank';
             downloadButton.style.display = 'inline-block';
         } else {
             downloadButton.href = 'https://www.faselhds.life/search?s=' + encodeURIComponent(movie.title) + '#download';
             downloadButton.target = '_blank';
             downloadButton.style.display = 'inline-block';
         }
     }
    
    // عرض النافذة
    movieDetailsModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
}

// إغلاق نافذة تفاصيل الفيلم
function closeMovieDetails() {
    movieDetailsModal.classList.remove('active');
    document.body.style.overflow = ''; // استعادة التمرير
}

// تبديل الوضع الليلي/النهاري
function toggleTheme() {
    body.classList.toggle('light-mode');
    
    // تحديث أيقونة الزر
    const icon = themeToggleBtn.querySelector('i');
    if (body.classList.contains('light-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
    
    // حفظ التفضيل في التخزين المحلي
    localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
}

// إضافة فيلم للمفضلة
function toggleFavorite(movieId) {
    // الحصول على قائمة المفضلة من التخزين المحلي
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // التحقق مما إذا كان الفيلم موجودًا بالفعل في المفضلة
    const index = favorites.indexOf(movieId);
    
    if (index === -1) {
        // إضافة الفيلم للمفضلة
        favorites.push(movieId);
        // تحديث أيقونة القلب
        document.querySelector(`.movie-card[data-id="${movieId}"] .like-btn i`).classList.remove('far');
        document.querySelector(`.movie-card[data-id="${movieId}"] .like-btn i`).classList.add('fas');
    } else {
        // إزالة الفيلم من المفضلة
        favorites.splice(index, 1);
        // تحديث أيقونة القلب
        document.querySelector(`.movie-card[data-id="${movieId}"] .like-btn i`).classList.remove('fas');
        document.querySelector(`.movie-card[data-id="${movieId}"] .like-btn i`).classList.add('far');
    }
    
    // حفظ التغييرات
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// البحث عن الأفلام
function searchMovies(query) {
    query = query.trim().toLowerCase();
    
    if (!query) {
        // إذا كان البحث فارغًا، عرض جميع الأفلام
        renderMovies(moviesData);
        return;
    }
    
    // البحث في العنوان والسنة والتصنيفات
    const results = moviesData.filter(movie => {
        return (
            movie.title.toLowerCase().includes(query) ||
            movie.year.toString().includes(query) ||
            movie.genres.some(genre => genre.toLowerCase().includes(query))
        );
    });
    
    // عرض نتائج البحث
    renderMovies(results);
}

// عرض الأفلام في الشبكة
function renderMovies(movies) {
    const movieGrid = document.querySelector('.movie-grid');
    if (!movieGrid) return;
    
    // مسح المحتوى الحالي
    movieGrid.innerHTML = '';
    
    // التحقق من وجود أفلام
    if (!movies || movies.length === 0) {
        movieGrid.innerHTML = '<div class="no-movies">لم يتم العثور على أفلام. يرجى المحاولة مرة أخرى لاحقًا.</div>';
        return;
    }
    
    // الحصول على قائمة المفضلة من التخزين المحلي
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.setAttribute('data-id', movie.id);
        
        // تحديد ما إذا كان الفيلم مفضلاً
        const isFavorite = favorites.includes(movie.id);
        
        // التأكد من وجود صورة للفيلم
        const posterUrl = movie.poster || 'https://via.placeholder.com/300x450?text=No+Image';
        
        movieCard.innerHTML = `
            <div class="movie-poster">
                <img src="${posterUrl}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="movie-actions">
                    <button class="play-btn"><i class="fas fa-play"></i></button>
                    <button class="like-btn"><i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i></button>
                </div>
            </div>
            <div class="movie-details">
                <h3>${movie.title}</h3>
                <div class="movie-meta">
                    <span class="year">${movie.year}</span>
                    <span class="rating"><i class="fas fa-star"></i> ${movie.rating ? movie.rating.toFixed(1) : '0.0'}</span>
                </div>
            </div>
        `;
        
        // إضافة مستمع حدث للنقر على بطاقة الفيلم
        movieCard.addEventListener('click', () => {
            openMovieDetails(movie.id);
        });
        
        // إضافة مستمع حدث لزر التشغيل
        const playBtn = movieCard.querySelector('.play-btn');
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // منع انتشار الحدث إلى بطاقة الفيلم
            
            // فتح رابط المشاهدة في نافذة جديدة
            if (movie.watchUrl && movie.watchUrl !== '#') {
                window.open(movie.watchUrl, '_blank');
            } else {
                window.open('https://www.faselhds.life/search?s=' + encodeURIComponent(movie.title), '_blank');
            }
        });
        
        // إضافة مستمع حدث لزر الإعجاب
        const likeBtn = movieCard.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // منع انتشار الحدث إلى بطاقة الفيلم
            toggleFavorite(movie.id);
            const heartIcon = likeBtn.querySelector('i');
            heartIcon.className = heartIcon.classList.contains('fas') ? 'far fa-heart' : 'fas fa-heart';
        });
        
        movieGrid.appendChild(movieCard);
    });
}

// ===== أحداث المستمع =====

// إضافة معرفات الأفلام إلى بطاقات الأفلام (محاكاة)
movieCards.forEach((card, index) => {
    card.setAttribute('data-id', moviesData[index % moviesData.length].id);
});

// إضافة مستمعي الأحداث عند تحميل المستند
document.addEventListener('DOMContentLoaded', () => {
    // مستمع لبطاقات الأفلام
    movieCards.forEach(card => {
        card.addEventListener('click', () => {
            const movieId = parseInt(card.getAttribute('data-id'));
            openMovieDetails(movieId);
        });
        
        // مستمع لزر الإعجاب
        const likeBtn = card.querySelector('.like-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // منع انتشار الحدث إلى البطاقة
                const movieId = parseInt(card.getAttribute('data-id'));
                toggleFavorite(movieId);
            });
        }
    });
    
    // مستمع لزر إغلاق النافذة المنبثقة
    closeModalBtn.addEventListener('click', closeMovieDetails);
    
    // مستمع للنقر خارج النافذة المنبثقة لإغلاقها
    movieDetailsModal.addEventListener('click', (e) => {
        if (e.target === movieDetailsModal) {
            closeMovieDetails();
        }
    });
    
    // مستمع لزر تبديل السمة
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // مستمع لحقل البحث
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchMovies(e.target.value);
        });
    }
    
    // تحميل تفضيل السمة من التخزين المحلي
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
    
    // تحميل المفضلة من التخزين المحلي
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    favorites.forEach(movieId => {
        const card = document.querySelector(`.movie-card[data-id="${movieId}"]`);
        if (card) {
            const icon = card.querySelector('.like-btn i');
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
        }
    });
});

// ===== تهيئة التطبيق =====
// هذه الوظيفة ستُستدعى عند تحميل البيانات من API في التطبيق الحقيقي
function initializeApp() {
    // عرض الأفلام المؤقتة أثناء التحميل
    renderMovies(moviesData);
    updateFeaturedMovie(moviesData[0]);
    
    // جلب الأفلام من موقع فاصل إعلاني
    fetchMoviesFromFaselHD();
}

// وظيفة تهيئة بديلة للتوافق
function initApp() {
    // تحميل الإعدادات المحفوظة
    loadTheme();
    loadFavorites();
    
    // عرض الأفلام المؤقتة أثناء التحميل
    renderMovies(moviesData);
    updateFeaturedMovie(moviesData[0]);
    
    // جلب الأفلام من موقع فاصل إعلاني
    fetchMoviesFromFaselHD();
}

// تحديث قسم الفيلم المميز
function updateFeaturedMovie(movie) {
    const featuredSection = document.querySelector('.featured-movie');
    if (!featuredSection || !movie) return;
    
    featuredSection.querySelector('.featured-backdrop').style.backgroundImage = `url(${movie.backdrop})`;
    featuredSection.querySelector('.featured-info h2').textContent = movie.title;
    featuredSection.querySelector('.featured-info .rating').innerHTML = `<i class="fas fa-star"></i> ${movie.rating}`;
    featuredSection.querySelector('.featured-info .year').textContent = movie.year;
    featuredSection.querySelector('.featured-info .description').textContent = movie.description;
    
    // تحديث التصنيفات
    const genresContainer = featuredSection.querySelector('.genres');
    genresContainer.innerHTML = '';
    movie.genres.forEach(genre => {
        const genreSpan = document.createElement('span');
        genreSpan.className = 'genre';
        genreSpan.textContent = genre;
        genresContainer.appendChild(genreSpan);
    });
}

// استدعاء وظيفة التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    // جلب الأفلام من موقع فاصل إعلاني
    fetchMoviesFromFaselHD();
});