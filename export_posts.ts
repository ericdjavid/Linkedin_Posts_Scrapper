import puppeteer, { Page } from "puppeteer";
import readline from "readline";
import csvWriter from "csv-write-stream";
import fs from "fs";

interface PostData {
  content: string;
  likes: number;
  comments: number;
  republications: number;
  imageUrl: string;
  publicationDate: string;
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page: Page = await browser.newPage();
  await page.goto("https://www.linkedin.com/uas/login", {
    waitUntil: "networkidle2",
  });

  // Log in to LinkedIn
  await page.type("#username", "YOUR_EMAIL");
  await page.type("#password", "YOUR_PASSWORD");
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // Check if the navigation took us to the LinkedIn feed
  const currentUrl = page.url();
  if (currentUrl !== "https://www.linkedin.com/feed/") {
    // Wait for manual verification code entry
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    await new Promise<void>((resolve) => {
      rl.question(
        "Please enter the verification code manually and press Enter to continue...",
        () => {
          rl.close();
          resolve();
        }
      );
    });
  }

  // Navigate to the specific LinkedIn page
  await page.goto(
    "https://www.linkedin.com/in/benoitdubos/recent-activity/all/",
    { waitUntil: "domcontentloaded" }
  );
  // await page.goto('https://www.linkedin.com/in/kevindufraisse/recent-activity/all/', { waitUntil: 'domcontentloaded' });
  // await page.goto('https://www.linkedin.com/in/oussamaammar/recent-activity/all/', { waitUntil: 'domcontentloaded' });
  // await page.goto('https://www.linkedin.com/in/gregoiregambatto/recent-activity/all/', { waitUntil: 'domcontentloaded' });
  // await page.goto('https://www.linkedin.com/in/marclouvion/recent-activity/all/', { waitUntil: 'domcontentloaded' });
  // await page.goto('https://www.linkedin.com/in/thibault-louis/recent-activity/all/', { waitUntil: 'domcontentloaded' });

  // await page.goto('https://www.linkedin.com/in/eric-djavid-2154b991/recent-activity/all/', { waitUntil: 'domcontentloaded' });

  // Wait for 1 seconds to ensure all content is loaded
  await page.evaluate(
    () => new Promise((resolve) => setTimeout(resolve, 3000))
  );
  let postData: PostData[] = [];

  // Enable request interception
  await page.setRequestInterception(true);

  // Listen for requests and block navigation
  page.on("request", (request: any) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      request.abort();
    } else {
      request.continue();
    }
  });

  let loadMoreVisible = true;
  // let loadMoreCount = 0;
  while (loadMoreVisible) {
    // while (loadMoreCount < 10) {
    try {
      // Wait for the button to be visible and click it
      await page.waitForSelector(".scaffold-finite-scroll__load-button", {
        visible: true,
        timeout: 10000,
      });

      await page.evaluate(() => {
        const button = document.querySelector(
          ".scaffold-finite-scroll__load-button"
        );
        if (button) {
          (button as HTMLElement).click();
        }
      });

      await page.evaluate(
        () => new Promise((resolve) => setTimeout(resolve, 3000))
      );
      // loadMoreCount++;
    } catch (e) {
      console.log("No more 'Load More' button found or an error occurred:", e);
      loadMoreVisible = false;
      // scroll to top of the page
      await page.evaluate(
        () => new Promise((resolve) => setTimeout(resolve, 3000))
      );
      await page.evaluate(() => window.scrollTo(0, 0));
    }
  }

  const postsExist = await page.evaluate(() => {
    return (
      document.querySelectorAll(
        "li.profile-creator-shared-feed-update__container"
      ).length > 0
    );
  });

  if (!postsExist) {
    console.log("No posts found. Check the CSS selector.");
    const currentUrl = page.url();
    console.log("Current URL:", currentUrl);
    // break;
  }

  // Extract posts using page.evaluate
  const posts = await page.evaluate(() => {
    const postElements = document.querySelectorAll(
      "li.profile-creator-shared-feed-update__container"
    );
    return Array.from(postElements)
      .map((post) => {
        const postElement = post as HTMLElement;

        // Check if the post is a republication
        const headerText =
          postElement.querySelector(".update-components-header__text-view")
            ?.textContent || "";
        if (headerText.includes("a republié ceci")) {
          return null; // Skip this post
        }

        const content =
          (postElement.querySelector("span.break-words") as HTMLElement)
            ?.innerText || "";

        // Parse likes, handling commas and non-breaking spaces
        const likesText =
          postElement
            .querySelector(".social-details-social-counts__reactions-count")
            ?.textContent?.trim() ?? "0";
        const likes = parseInt(likesText.replace(/[\s,]/g, ""));

        // Extract comments amount
        const commentsText =
          (
            postElement.querySelector(
              '.social-details-social-counts__comments span[aria-hidden="true"]'
            ) as HTMLElement
          )?.innerText ?? "0";
        const comments = parseInt(commentsText.replace(/\D/g, ""));

        // Extract republications amount
        const republicationsText =
          (
            postElement.querySelector(
              '.social-details-social-counts__item--truncate-text span[aria-hidden="true"]'
            ) as HTMLElement
          )?.innerText ?? "0";
        const republications = parseInt(republicationsText.replace(/\D/g, ""));

        // Extract image URL
        const imageUrl =
          postElement
            .querySelector(".update-components-image__image")
            ?.getAttribute("src") ?? "";

        // Extract publication date
        const publicationDate =
          (
            postElement.querySelector(
              '.update-components-actor__sub-descriptin span[aria-hidden="true"]'
            ) as HTMLElement
          )?.innerText ?? "";

        return {
          content,
          likes,
          comments,
          republications,
          imageUrl,
          publicationDate,
        };
      })
      .filter((post) => post !== null); // Filter out null values
  });

  postData.push(...posts);

  // After extracting posts
  console.log("Extracted posts:", postData);

  // Filter out posts with empty content or zero likes
  const filteredPosts = postData
    .filter((post) => post.content.trim() !== "" && post.likes > 0)
    .map((post) => ({
      content: post.content,
      likes: post.likes,
      comments: post.comments,
      republications: post.republications,
      imageUrl: post.imageUrl,
      publicationDate: post.publicationDate,
    }));

  console.log("Filtered posts:", filteredPosts);

  // Write filtered posts to a CSV file
  if (filteredPosts.length) {
    // Check if the file exists and delete it to ensure it's replaced
    const filePath = "linkedin_posts.csv";
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const writer = csvWriter({
      headers: [
        "Post Content",
        "Likes",
        "Comments",
        "Republications",
        "Image URL",
        "Publication Date",
      ],
    });
    writer.pipe(fs.createWriteStream(filePath));

    filteredPosts.forEach((data) => {
      writer.write([
        data.content,
        data.likes.toString(),
        data.comments.toString(),
        data.republications.toString(),
        data.imageUrl,
        data.publicationDate,
      ]);
    });

    writer.end();
    console.log(`Total number of exported posts: ${filteredPosts.length}`);
  } else {
    console.log("No valid post data to write to CSV.");
  }

  await browser.close();
})();
