import type { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>RLY Rewards Info</title>
        <meta
          name="description"
          content="RLY Network Association distributes network rewards based on these statistics to incentivize growth and adoption of the RLY ecosystem."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Link href="/solana">
          <a>View Solana Data</a>
        </Link>
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Home;
