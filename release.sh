cd api
pnpm i
pnpm build
cd ../client
pnpm i
pnpm build
sudo systemctl restart crypto-registry.service
