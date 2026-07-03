# TKI-STYS-dev
Türkiye Kömür İşletmeleri için bir Sosyal Tesis yönetim sistemi.


-------------------------------------------------------
node bağımlılıklarını kurmak için "npm install"
backend dosyalarını toparlamak için "dotnet restore"

-------------------------------------------------------

03/07/2026 tarihinde bize ait olan bütün alt branchları sildim. özellik bazlı ilerleyeceğimiz için farklı dallar olacak:
mainden önce kodların birleştirilip test edildiği bir "develop" branchı
sonrasında iş bölümüne göre özellikler eklenirken herkesin ilgilendiği özel bir branch olacak.

mesela devran faturalandırma özelliği ile ilgileniyorsa
"feature/faturalandirma" adında bir branch açacak ve tamamen bunun üstünde çalışacak.

o özellik ile işi bittiğinde "develop" branchına yükleyip "feature/faturalandirma" branchını silebilir.
