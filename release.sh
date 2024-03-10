cd api
pnpm build
cd ../client
pnpm build
sudo systemctl restart crypto-registry.service
