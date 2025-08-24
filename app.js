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

// متغير لتتبع حالة التحميل
let isLoading = false;

// وظيفة لعرض مؤشر التحميل
function showLoading() {
    isLoading = true;
    const movieGrid = document.querySelector('.movie-grid');
    if (movieGrid) {
        movieGrid.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>جاري تحميل الأفلام من موقع فاصل إعلاني...</p>
            </div>
        `;
    }
}

// وظيفة لإخفاء مؤشر التحميل
function hideLoading() {
    isLoading = false;
    const loadingContainers = document.querySelectorAll('.loading-container');
    loadingContainers.forEach(container => container.remove());
}

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
            
            // تحديث عنوان القسم بعدد الأفلام
            const sectionHeader = document.querySelector('.section-header h2');
            if (sectionHeader) {
                sectionHeader.textContent = `الأفلام الجديدة (${moviesData.length})`;
            }
            return;
        }
        
        // عرض مؤشر التحميل
        showLoading();
        
        // استخدام CORS proxy لتجاوز قيود الأمان - تجربة عدة خيارات
        const corsProxies = [
            'https://corsproxy.io/?',
            'https://api.allorigins.win/raw?url=',
            'https://cors-anywhere.herokuapp.com/',
            'https://crossorigin.me/',
            'https://thingproxy.freeboard.io/fetch/',
            'https://yacdn.org/proxy/',
            'https://api.codetabs.com/v1/proxy/?quest='
        ];
        
        // اختيار CORS proxy بشكل عشوائي لزيادة فرص النجاح
        const randomIndex = Math.floor(Math.random() * corsProxies.length);
        const corsProxy = corsProxies[randomIndex];
        console.log(`استخدام CORS proxy: ${corsProxy}`);
        
        // تعيين مهلة زمنية للطلب
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 ثانية كحد أقصى
        const faselHDUrl = 'https://www.faselhds.life/';
        
        // عرض رسالة تحميل
        console.log('جاري تحميل الأفلام من موقع فاصل إعلاني...');
        
        // جلب محتوى الصفحة مع معالجة الأخطاء
        let response;
        let html = '';
        
        try {
            // محاولة استخدام CORS proxy المحدد
            response = await fetch(corsProxy + encodeURIComponent(faselHDUrl), {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml',
                    'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Referer': 'https://www.google.com/'
                }
            });
            
            if (!response.ok) {
                throw new Error(`فشل الاتصال بالموقع: ${response.status} ${response.statusText}`);
            }
            
            html = await response.text();
            
            // التحقق من أن المحتوى ليس فارغًا
            if (!html || html.trim().length === 0) {
                throw new Error('تم استلام محتوى فارغ من الموقع');
            }
            
            console.log('تم جلب محتوى الصفحة بنجاح');
        } catch (fetchError) {
            console.error('خطأ في جلب محتوى الصفحة:', fetchError);
            
            // محاولة استخدام CORS proxy آخر
            for (let i = 0; i < corsProxies.length; i++) {
                if (corsProxies[i] === corsProxy) continue; // تخطي الـ proxy الذي فشل
                
                try {
                    console.log(`محاولة استخدام CORS proxy بديل: ${corsProxies[i]}`);
                    
                    response = await fetch(corsProxies[i] + encodeURIComponent(faselHDUrl), {
                        signal: controller.signal,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml',
                            'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                            'Referer': 'https://www.google.com/'
                        }
                    });
                    
                    if (!response.ok) continue;
                    
                    html = await response.text();
                    
                    if (html && html.trim().length > 0) {
                        console.log(`تم جلب محتوى الصفحة بنجاح باستخدام CORS proxy بديل: ${corsProxies[i]}`);
                        break;
                    }
                } catch (alternativeError) {
                    console.error(`فشل استخدام CORS proxy البديل ${corsProxies[i]}:`, alternativeError);
                }
            }
            
            // إذا لم ينجح أي CORS proxy
            if (!html || html.trim().length === 0) {
                // محاولة استخدام البيانات المخزنة محليًا
                const cachedMovies = localStorage.getItem('cachedMovies');
                if (cachedMovies) {
                    try {
                        moviesData = JSON.parse(cachedMovies);
                        console.log(`تم استرجاع ${moviesData.length} فيلم من التخزين المحلي`);
                        renderMovies(moviesData);
                        updateFeaturedMovie(moviesData[0]);
                        updateSectionHeader('New Movies', moviesData.length);
                        hideLoading();
                        
                        // محاولة جلب الأفلام مرة أخرى بعد فترة
                        setTimeout(() => {
                            console.log('محاولة جلب الأفلام مرة أخرى...');
                            fetchMoviesFromFaselHD().catch(e => console.error('فشلت المحاولة الثانية:', e));
                        }, 10000); // محاولة مرة أخرى بعد 10 ثوانٍ
                        
                        return moviesData;
                    } catch (e) {
                        console.error('خطأ في تحليل البيانات المخزنة محليًا:', e);
                    }
                }
                
                // إذا لم نجد بيانات مخزنة، نعيد البيانات المؤقتة
                moviesData = tempMoviesData;
                renderMovies(moviesData);
                updateSectionHeader('New Movies', moviesData.length);
                hideLoading();
                return moviesData;
            }
        } finally {
            // إلغاء المهلة الزمنية
            clearTimeout(timeoutId);
        }
        
        // إنشاء DOM parser لتحليل HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // تحديد عناصر الأفلام - محاولة عدة محددات CSS
        let movieElements = [];
        const selectors = [
            '.GridItem',
            '.postDiv',
            '.movie-wrap',
            '.col-s-6',
            '.col-xs-6',
            '.col-6',
            '.movie-box',
            '.movie-item',
            '.movie',
            '.poster',
            '.poster-wraper',
            '.poster-container',
            '.col-xl-2, .col-lg-3, .col-md-4, .col-sm-6',
            '[class*="movie"], [class*="post"], [class*="film"], [class*="series"]'
        ];
        
        // محاولة كل محدد حتى نجد عناصر الأفلام
        for (const selector of selectors) {
            const elements = doc.querySelectorAll(selector);
            if (elements && elements.length > 0) {
                console.log(`تم العثور على ${elements.length} فيلم باستخدام المحدد ${selector}`);
                movieElements = elements;
                break;
            }
        }
        
        // إذا لم يتم العثور على أي عناصر، نحاول البحث عن أي عناصر تحتوي على صور وروابط
        if (movieElements.length === 0) {
            console.log('محاولة البحث عن عناصر تحتوي على صور وروابط...');
            const allElements = doc.querySelectorAll('div');
            
            for (const element of allElements) {
                if (element.querySelector('img') && element.querySelector('a')) {
                    movieElements = Array.from(allElements).filter(el => 
                        el.querySelector('img') && el.querySelector('a'));
                    console.log(`تم العثور على ${movieElements.length} عنصر محتمل للأفلام`);
                    break;
                }
            }
        }

        console.log(`تم العثور على ${movieElements.length} فيلم في المجموع`);
        
        // تحويل العناصر إلى مصفوفة من بيانات الأفلام
        const movies = [];
        
        movieElements.forEach((element, index) => {
            try {
                // استخراج عنوان الفيلم - محاولة عدة طرق
                let title = '';
                
                // طريقة 1: البحث عن عناصر العنوان المعروفة
                const titleSelectors = [
                    '.h1', 'h1', '.h2', 'h2', '.h3', 'h3', '.title', '.name',
                    '.movie-title', '.post-title', '.entry-title', '.film-title',
                    'a[title]', '[data-title]', '[aria-label]', '.caption', '.movie-caption',
                    '.meta .title', '.info .title', '.details .title'
                ];
                
                let titleElement = null;
                for (const selector of titleSelectors) {
                    titleElement = element.querySelector(selector);
                    if (titleElement && titleElement.textContent.trim()) {
                        title = titleElement.textContent.trim();
                        console.log(`تم العثور على عنوان باستخدام المحدد ${selector}: ${title}`);
                        break;
                    }
                }
                
                // طريقة 2: البحث عن سمة العنوان في الروابط
                if (!title) {
                    const linkWithTitle = element.querySelector('a[title]');
                    if (linkWithTitle && linkWithTitle.getAttribute('title')) {
                        title = linkWithTitle.getAttribute('title').trim();
                        console.log(`تم العثور على عنوان من سمة العنوان للرابط: ${title}`);
                    }
                }
                
                // طريقة 3: محاولة العثور على العنوان من النص البديل للصورة
                if (!title) {
                    const img = element.querySelector('img');
                    if (img && img.alt && img.alt.trim()) {
                        title = img.alt.trim();
                        console.log(`تم العثور على عنوان من النص البديل للصورة: ${title}`);
                    }
                }
                
                // طريقة 4: استخدام نص الرابط
                if (!title) {
                    const link = element.querySelector('a');
                    if (link && link.textContent.trim()) {
                        title = link.textContent.trim();
                        console.log(`تم العثور على عنوان من نص الرابط: ${title}`);
                    }
                }
                
                // تجاهل العناصر التي ليست أفلامًا
                if (!title || title.length < 2) {
                    console.log('تم تخطي عنصر لعدم وجود عنوان');
                    return;
                }
                
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
                
                // استخراج صورة الفيلم - محاولة عدة طرق
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
                    const srcAttributes = ['src', 'data-src', 'data-lazy-src', 'data-original', 'data-image', 
                                          'data-img', 'data-poster', 'data-cover', 'data-bg', 'data-background', 'data-original-src'];
                    for (const attr of srcAttributes) {
                        if (posterElement.hasAttribute(attr)) {
                            const srcValue = posterElement.getAttribute(attr);
                            if (srcValue && srcValue.trim() !== '') {
                                poster = srcValue;
                                console.log(`تم العثور على صورة باستخدام السمة ${attr}: ${poster}`);
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
                        } else {
                            poster = 'https://www.faselhds.life/' + poster;
                        }
                        console.log(`تم تحويل رابط الصورة النسبي إلى مطلق: ${poster}`);
                    }
                }
                
                // البحث عن الصورة في عناصر الخلفية إذا لم نجدها
                if (poster === 'https://via.placeholder.com/300x450?text=No+Image') {
                    const elementsWithBg = element.querySelectorAll('[style*="background"]');
                    for (const el of elementsWithBg) {
                        const style = el.getAttribute('style');
                        if (style) {
                            const match = style.match(/background(-image)?\s*:\s*url\(['"']?([^'"'\)]+)['"']?\)/i);
                            if (match && match[2]) {
                                poster = match[2];
                                console.log(`تم العثور على صورة من خلفية العنصر: ${poster}`);
                                break;
                            }
                        }
                    }
                }
                
                // استخراج رابط الفيلم - محاولة عدة طرق
                const linkSelectors = ['a', '.link', '.more', '.details', '.watch'];
                
                let linkElement = null;
                for (const selector of linkSelectors) {
                    linkElement = element.querySelector(selector);
                    if (linkElement) break;
                }
                
                let link = '';
                if (linkElement && linkElement.hasAttribute('href')) {
                    link = linkElement.getAttribute('href');
                    console.log(`تم العثور على رابط باستخدام المحدد: ${link}`);
                }
                
                // طريقة 2: البحث عن الروابط المباشرة التي تحتوي على صور
                if (!link) {
                    const linkElements = element.querySelectorAll('a');
                    if (linkElements && linkElements.length > 0) {
                        // نختار الرابط الذي يحتوي على الصورة
                        for (const linkEl of linkElements) {
                            if (linkEl.querySelector('img')) {
                                link = linkEl.getAttribute('href');
                                console.log(`تم العثور على رابط يحتوي على صورة: ${link}`);
                                break;
                            }
                        }
                    }
                }
                
                // طريقة 3: البحث عن سمات تحتوي على روابط
                if (!link) {
                    const possibleAttributes = ['data-href', 'data-url', 'data-link', 'data-src'];
                    for (const attr of possibleAttributes) {
                        if (element.hasAttribute(attr)) {
                            link = element.getAttribute(attr);
                            console.log(`تم العثور على رابط من السمة ${attr}: ${link}`);
                            break;
                        }
                    }
                }
                
                // التحقق من أن الرابط مطلق
                if (link && !link.startsWith('http')) {
                    if (link.startsWith('//')) {
                        link = 'https:' + link;
                    } else if (link.startsWith('/')) {
                        link = 'https://www.faselhds.life' + link;
                    } else {
                        link = 'https://www.faselhds.life/' + link;
                    }
                    console.log(`تم تحويل رابط الفيلم النسبي إلى مطلق: ${link}`);
                }
                
                if (!link) {
                    link = `https://www.faselhds.life/search?s=${encodeURIComponent(title)}`;
                    console.log('استخدام رابط بحث افتراضي لعدم وجود رابط للفيلم');
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
            
            // إخفاء مؤشر التحميل
            hideLoading();
            
            // تحديث واجهة المستخدم
            renderMovies(moviesData);
            updateFeaturedMovie(moviesData[0]);
            
            // تحديث عنوان القسم بعدد الأفلام
            const sectionHeader = document.querySelector('.section-header h2');
            if (sectionHeader) {
                sectionHeader.textContent = `الأفلام الجديدة (${moviesData.length})`;
            }
            
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
                
                // تحديث عنوان القسم بعدد الأفلام
                const sectionHeader = document.querySelector('.section-header h2');
                if (sectionHeader) {
                    sectionHeader.textContent = `الأفلام الجديدة (${moviesData.length})`;
                }
            }
        }
    } catch (error) {
        console.error('حدث خطأ أثناء جلب الأفلام:', error);
        
        // إخفاء مؤشر التحميل
        hideLoading();
        
        // محاولة استرداد البيانات المخزنة مسبقًا
        const cachedMovies = localStorage.getItem('cachedMovies');
        if (cachedMovies) {
            try {
                moviesData = JSON.parse(cachedMovies);
                console.log(`تم استرداد ${moviesData.length} فيلم من التخزين المحلي`);
                renderMovies(moviesData);
                updateFeaturedMovie(moviesData[0]);
                updateSectionHeader('New Movies', moviesData.length);
                
                // محاولة جلب الأفلام مرة أخرى بعد فترة
                setTimeout(() => {
                    console.log('محاولة جلب الأفلام مرة أخرى بعد الفشل...');
                    fetchMoviesFromFaselHD().catch(e => console.error('فشلت المحاولة الثانية:', e));
                }, 15000); // محاولة مرة أخرى بعد 15 ثانية
            } catch (e) {
                console.error('خطأ في تحليل البيانات المخزنة محليًا:', e);
                // استخدام البيانات المؤقتة في حالة فشل تحليل البيانات المخزنة
                moviesData = tempMoviesData;
                renderMovies(moviesData);
                updateSectionHeader('New Movies', moviesData.length);
            }
        } else {
            // عرض رسالة خطأ إذا لم تكن هناك بيانات مخزنة
            const movieGrid = document.querySelector('.movie-grid');
            if (movieGrid) {
                movieGrid.innerHTML = `<div class="no-movies">حدث خطأ أثناء تحميل الأفلام. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.</div>`;
            }
            
            // استخدام البيانات المؤقتة
            moviesData = tempMoviesData;
            renderMovies(moviesData);
            updateSectionHeader('New Movies', moviesData.length);
            
            // محاولة جلب الأفلام مرة أخرى بعد فترة
            setTimeout(() => {
                console.log('محاولة جلب الأفلام مرة أخرى بعد الفشل...');
                fetchMoviesFromFaselHD().catch(e => console.error('فشلت المحاولة الثانية:', e));
            }, 15000); // محاولة مرة أخرى بعد 15 ثانية
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
    const backdropElement = modalContent.querySelector('.movie-backdrop');
    if (backdropElement) {
        backdropElement.src = movie.backdrop || movie.poster;
        backdropElement.onerror = function() {
            this.src = 'https://via.placeholder.com/1200x500?text=No+Image';
        };
    }
    
    const posterElement = modalContent.querySelector('.movie-poster-large img');
    if (posterElement) {
        posterElement.src = movie.poster;
        posterElement.onerror = function() {
            this.src = 'https://via.placeholder.com/300x450?text=No+Image';
        };
    }
    
    // تحديث المعلومات الأساسية
    modalContent.querySelector('.movie-header-info h2').textContent = movie.title;
    modalContent.querySelector('.movie-meta .year').textContent = movie.year;
    modalContent.querySelector('.movie-meta .duration').textContent = movie.duration || '120 دقيقة';
    modalContent.querySelector('.movie-meta .rating').innerHTML = `<i class="fas fa-star"></i> ${movie.rating ? movie.rating.toFixed(1) : '0.0'}`;
    
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
    const descriptionElement = modalContent.querySelector('.movie-description p');
    if (descriptionElement) {
        descriptionElement.textContent = movie.description || `مشاهدة وتحميل ${movie.title} مترجم اون لاين بجودة عالية على موقع فاصل إعلاني.`;
    }
    
    // إضافة روابط المشاهدة والتحميل
    const watchButton = modalContent.querySelector('.watch-btn');
    const downloadButton = modalContent.querySelector('.download-btn');
     
    if (watchButton) {
        if (movie.watchUrl && movie.watchUrl !== '#' && movie.watchUrl.trim() !== '') {
            watchButton.href = movie.watchUrl;
            watchButton.target = '_blank';
            watchButton.rel = 'noopener noreferrer'; // أمان إضافي
            watchButton.style.display = 'inline-block';
        } else {
            watchButton.href = 'https://www.faselhds.life/search?s=' + encodeURIComponent(movie.title);
            watchButton.target = '_blank';
            watchButton.rel = 'noopener noreferrer';
            watchButton.style.display = 'inline-block';
        }
        
        // إضافة مستمع حدث لزر المشاهدة لتتبع النقرات
        watchButton.addEventListener('click', function() {
            console.log(`تم النقر على زر مشاهدة فيلم: ${movie.title}`);
            // يمكن إضافة تحليلات أو إحصائيات هنا
        });
    }
     
    if (downloadButton) {
        if (movie.downloadUrl && movie.downloadUrl !== '#' && movie.downloadUrl.trim() !== '') {
            downloadButton.href = movie.downloadUrl;
            downloadButton.target = '_blank';
            downloadButton.rel = 'noopener noreferrer';
            downloadButton.style.display = 'inline-block';
        } else {
            downloadButton.href = 'https://www.faselhds.life/search?s=' + encodeURIComponent(movie.title) + '#download';
            downloadButton.target = '_blank';
            downloadButton.rel = 'noopener noreferrer';
            downloadButton.style.display = 'inline-block';
        }
        
        // إضافة مستمع حدث لزر التحميل لتتبع النقرات
        downloadButton.addEventListener('click', function() {
            console.log(`تم النقر على زر تحميل فيلم: ${movie.title}`);
            // يمكن إضافة تحليلات أو إحصائيات هنا
        });
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
    
    // تحويل المعرف إلى رقم إذا كان نصًا
    const numericId = parseInt(movieId);
    
    // التحقق مما إذا كان الفيلم موجودًا بالفعل في المفضلة
    const index = favorites.indexOf(numericId);
    
    if (index === -1) {
        // إضافة الفيلم للمفضلة
        favorites.push(numericId);
        // تحديث أيقونة القلب
        document.querySelector(`.movie-card[data-id="${movieId}"] .like-btn i`).classList.remove('far');
        document.querySelector(`.movie-card[data-id="${movieId}"] .like-btn i`).classList.add('fas');
        console.log(`تمت إضافة الفيلم ${numericId} إلى المفضلة`);
    } else {
        // إزالة الفيلم من المفضلة
        favorites.splice(index, 1);
        // تحديث أيقونة القلب
        document.querySelector(`.movie-card[data-id="${movieId}"] .like-btn i`).classList.remove('fas');
        document.querySelector(`.movie-card[data-id="${movieId}"] .like-btn i`).classList.add('far');
        console.log(`تمت إزالة الفيلم ${numericId} من المفضلة`);
    }
    
    // حفظ التغييرات
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    return favorites.includes(numericId);
}

// ===== وظيفة عرض الأفلام المفضلة =====
function showFavoriteMovies() {
    console.log('عرض الأفلام المفضلة');
    
    // الحصول على قائمة الأفلام المفضلة من التخزين المحلي
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (favorites.length === 0) {
        // عرض رسالة إذا لم تكن هناك أفلام مفضلة
        const movieGrid = document.querySelector('.movie-grid');
        if (movieGrid) {
            movieGrid.innerHTML = '<div class="no-movies">لا توجد أفلام في المفضلة. قم بإضافة بعض الأفلام إلى المفضلة أولاً.</div>';
        }
        
        // تحديث عنوان القسم ليظهر أنه لا توجد أفلام مفضلة
        const sectionHeader = document.querySelector('.section-header h2');
        if (sectionHeader) {
            sectionHeader.textContent = 'الأفلام المفضلة (0)';
        }
        
        return;
    }
    
    // تصفية الأفلام المفضلة من قائمة الأفلام
    const favoriteMovies = moviesData.filter(movie => favorites.includes(parseInt(movie.id)));
    
    // تحديث عنوان القسم بعدد الأفلام المفضلة
    const sectionHeader = document.querySelector('.section-header h2');
    if (sectionHeader) {
        sectionHeader.textContent = `الأفلام المفضلة (${favoriteMovies.length})`;
    }
    
    // عرض الأفلام المفضلة
    renderMovies(favoriteMovies);
}

// ===== وظيفة تصفية الأفلام حسب الفئة =====
function filterMoviesByGenre(genre) {
    console.log(`تصفية الأفلام حسب الفئة: ${genre}`);
    
    // التحقق من وجود أفلام
    if (!moviesData || moviesData.length === 0) {
        console.log('لا توجد أفلام للتصفية');
        return;
    }
    
    // تصفية الأفلام حسب الفئة
    const filteredMovies = moviesData.filter(movie => {
        // التحقق من وجود الفئات
        if (!movie.genres || !Array.isArray(movie.genres)) {
            return false;
        }
        
        // البحث عن الفئة في قائمة فئات الفيلم
        return movie.genres.some(g => g.includes(genre) || genre.includes(g));
    });
    
    console.log(`تم العثور على ${filteredMovies.length} فيلم في فئة ${genre}`);
    
    // تحديث عنوان القسم بعدد الأفلام في الفئة
    const sectionHeader = document.querySelector('.section-header h2');
    if (sectionHeader) {
        sectionHeader.textContent = `أفلام ${genre} (${filteredMovies.length})`;
    }
    
    // عرض الأفلام المصفاة أو رسالة إذا لم يتم العثور على أفلام
    if (filteredMovies.length === 0) {
        const movieGrid = document.querySelector('.movie-grid');
        if (movieGrid) {
            movieGrid.innerHTML = `<div class="no-movies">لا توجد أفلام في فئة "${genre}".</div>`;
        }
    } else {
        renderMovies(filteredMovies);
    }
}

// البحث عن الأفلام
function searchMovies(query) {
    query = query.trim().toLowerCase();
    
    if (!query) {
        // إذا كان البحث فارغًا، عرض جميع الأفلام
        renderMovies(moviesData);
        return;
    }
    
    // البحث في العنوان والسنة والتصنيفات والوصف
    const results = moviesData.filter(movie => {
        // البحث في العنوان
        const titleMatch = movie.title && movie.title.toLowerCase().includes(query);
        
        // البحث في التصنيفات
        const genreMatch = movie.genres && Array.isArray(movie.genres) && 
            movie.genres.some(genre => genre && genre.toLowerCase().includes(query));
        
        // البحث في السنة
        const yearMatch = movie.year && movie.year.toString().includes(query);
        
        // البحث في الوصف
        const descriptionMatch = movie.description && movie.description.toLowerCase().includes(query);
        
        return titleMatch || genreMatch || yearMatch || descriptionMatch;
    });
    
    console.log(`تم العثور على ${results.length} فيلم مطابق لـ "${query}"`);
    
    // تحديث عنوان القسم بعدد نتائج البحث
    const sectionHeader = document.querySelector('.section-header h2');
    if (sectionHeader) {
        sectionHeader.textContent = `نتائج البحث (${results.length})`;
    }
    
    // عرض نتائج البحث
    renderMovies(results);
    
    // إذا لم يتم العثور على نتائج، يمكن إضافة رسالة
    if (results.length === 0) {
        const movieGrid = document.querySelector('.movie-grid');
        if (movieGrid) {
            movieGrid.innerHTML = `<div class="no-results">لم يتم العثور على نتائج لـ "${query}"</div>`;
        }
    }
}

// ===== وظيفة عرض الأفلام في الصفحة =====
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
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
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
                // إذا لم يكن هناك رابط محدد، استخدم رابط البحث
                const searchUrl = `https://www.faselhds.life/search?s=${encodeURIComponent(movie.title)}`;
                window.open(searchUrl, '_blank');
            }
        });
        
        // إضافة مستمع حدث لزر المفضلة
        const likeBtn = movieCard.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // منع انتشار الحدث إلى بطاقة الفيلم
            toggleFavorite(movie.id);
            const heartIcon = likeBtn.querySelector('i');
            heartIcon.classList.toggle('far');
            heartIcon.classList.toggle('fas');
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
    console.log('بدء تهيئة التطبيق...');
    
    // إضافة مستمعي الأحداث للقائمة الجانبية
    setupSidebarListeners();
    
    // تهيئة وضع السمة
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
    
    // محاولة تحميل البيانات المخزنة مؤقتًا أولاً
    const cachedMovies = localStorage.getItem('cachedMovies');
    if (cachedMovies) {
        try {
            const parsedMovies = JSON.parse(cachedMovies);
            if (parsedMovies && parsedMovies.length > 0) {
                console.log(`تم تحميل ${parsedMovies.length} فيلم من التخزين المحلي`);
                moviesData = parsedMovies;
            }
        } catch (error) {
            console.error('خطأ في تحليل البيانات المخزنة:', error);
        }
    }
    
    // عرض الأفلام المؤقتة أثناء التحميل
    renderMovies(moviesData);
    updateFeaturedMovie(moviesData[0]);
    
    // تحديث عنوان القسم بعدد الأفلام
    const sectionHeader = document.querySelector('.section-header h2');
    if (sectionHeader && moviesData) {
        sectionHeader.textContent = `الأفلام الجديدة (${moviesData.length})`;
    }
    
    // جلب الأفلام من موقع فاصل إعلاني
    fetchMoviesFromFaselHD();
    
    console.log('اكتملت تهيئة التطبيق');
}

// ===== إعداد مستمعي الأحداث للقائمة الجانبية =====
function setupSidebarListeners() {
    // إضافة مستمع حدث لرابط المفضلة
    const favoritesLink = document.querySelector('.sidebar .main-nav a[href="#"] i.fa-heart');
    if (favoritesLink) {
        const favoritesListItem = favoritesLink.parentElement.parentElement;
        favoritesListItem.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة الفئة النشطة من جميع عناصر القائمة
            document.querySelectorAll('.sidebar .main-nav li').forEach(item => {
                item.classList.remove('active');
            });
            
            // إضافة الفئة النشطة إلى عنصر المفضلة
            favoritesListItem.classList.add('active');
            
            // عرض الأفلام المفضلة
            showFavoriteMovies();
        });
    }
    
    // إضافة مستمعي أحداث لفئات الأفلام
    const categoryTags = document.querySelectorAll('.category-tags .tag');
    categoryTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const genre = this.textContent.trim();
            console.log(`تصفية الأفلام حسب الفئة: ${genre}`);
            
            // إزالة الفئة النشطة من جميع الفئات
            categoryTags.forEach(t => t.classList.remove('active'));
            
            // إضافة الفئة النشطة إلى الفئة المحددة
            this.classList.add('active');
            
            // تصفية الأفلام حسب الفئة
            filterMoviesByGenre(genre);
        });
    });
    
    // إضافة مستمع حدث لرابط الرئيسية لعرض جميع الأفلام
    const homeLink = document.querySelector('.sidebar .main-nav a[href="#"] i.fa-home');
    if (homeLink) {
        const homeListItem = homeLink.parentElement.parentElement;
        homeListItem.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة الفئة النشطة من جميع عناصر القائمة
            document.querySelectorAll('.sidebar .main-nav li').forEach(item => {
                item.classList.remove('active');
            });
            
            // إزالة الفئة النشطة من جميع الفئات
            categoryTags.forEach(t => t.classList.remove('active'));
            
            // إضافة الفئة النشطة إلى عنصر الرئيسية
            homeListItem.classList.add('active');
            
            // عرض جميع الأفلام
            renderMovies(moviesData);
            
            // تحديث عنوان القسم بعدد الأفلام
            const sectionHeader = document.querySelector('.section-header h2');
            if (sectionHeader) {
                sectionHeader.textContent = `الأفلام الجديدة (${moviesData.length})`;
            }
        });
    }
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