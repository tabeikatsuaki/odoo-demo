FROM mcr.microsoft.com/playwright:v1.52.0-noble

RUN apt update && \
    apt install -y --no-install-recommends \
    # dos2unix \
    tzdata

WORKDIR /playwright

COPY package.json package-lock.json* ./

# RUN npm install && npx playwright install chromium
RUN npm install

COPY tests ./tests
COPY .env.docker .
COPY playwright.config.ts .

RUN mv .env.docker .env

# RUN npm run build

RUN mkdir /playwright/test-results
VOLUME /playwright/test-results

CMD ["npx", "playwright", "test"]