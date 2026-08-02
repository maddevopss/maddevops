$ErrorActionPreference = "Stop"

$sitemapPath = "t:\Projets\maddevops\Web\maddevops\sitemap.xml"
$robotsPath = "t:\Projets\maddevops\Web\maddevops\robots.txt"

Write-Host "Vérification de robots.txt..."
$robotsContent = Get-Content $robotsPath -Raw
if ($robotsContent -match "Sitemap: https://www.maddevops.com/sitemap.xml") {
    Write-Host "✅ robots.txt contient le bon Sitemap" -ForegroundColor Green
} else {
    Write-Host "❌ robots.txt ne contient pas le Sitemap attendu" -ForegroundColor Red
    exit 1
}

if ($robotsContent -match "Disallow: /`r?`n") {
    Write-Host "❌ robots.txt bloque tout le site!" -ForegroundColor Red
    exit 1
}

Write-Host "Vérification de sitemap.xml..."
try {
    [xml]$sitemap = Get-Content $sitemapPath
    Write-Host "✅ XML valide" -ForegroundColor Green
} catch {
    Write-Host "❌ sitemap.xml n'est pas un XML valide" -ForegroundColor Red
    exit 1
}

$urls = $sitemap.urlset.url.loc
$invalidUrls = 0
$seenUrls = @{}

foreach ($url in $urls) {
    if (-not $url.StartsWith("https://www.maddevops.com/")) {
        Write-Host "❌ URL invalide (domaine incorrect): $url" -ForegroundColor Red
        $invalidUrls++
    }
    
    if ($seenUrls.ContainsKey($url)) {
        Write-Host "❌ URL en double: $url" -ForegroundColor Red
        $invalidUrls++
    }
    $seenUrls[$url] = $true
}

if ($invalidUrls -eq 0) {
    Write-Host "✅ Toutes les URLs sont valides, aucun doublon, domaine correct." -ForegroundColor Green
} else {
    exit 1
}

Write-Host "Tests SEO terminés avec succès." -ForegroundColor Green
