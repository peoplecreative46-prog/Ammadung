// Tab Switching Logic
function switchTab(tabId) {
    // Hide all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // Remove active styling from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-slate-800', 'text-slate-400', 'hover:bg-slate-700');
    });

    // Show the targeted tab content
    document.getElementById(tabId).classList.add('active');

    // Add active styling to clicked button
    const activeBtn = event.currentTarget;
    activeBtn.classList.remove('bg-slate-800', 'text-slate-400', 'hover:bg-slate-700');
    activeBtn.classList.add('bg-blue-600', 'text-white');
}

// PDF Generation and Styling Tweaks for Print
function generatePDF() {
    const element = document.getElementById('portfolio-cv');
    
    // Configurations for a stunning crisp print document
    const opt = {
        margin:       [0.4, 0.4, 0.4, 0.4],
        filename:     'Portofolio_Akademik_Ahmad.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#0f172a' // Keeps beautiful slate dark mode profile matching the web look
        },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Execute the download
    html2pdf().set(opt).from(element).save();
}
