npm run build:kaios

cd build
zip -rX foxcasts.zip *
kosm install-packaged -i com.garredow.foxcasts -p foxcasts.zip

cd -