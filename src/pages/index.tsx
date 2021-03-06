import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';

import { useState } from 'react';

import { format } from '../utils/formatDate';
import { formatISO } from 'date-fns';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { ExitPreview } from '../components/ExitPreview';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination,
  preview: boolean
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState(postsPagination.results);

  function handlePagination() {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        setNextPage(data.nextPage);
        setPosts([...posts, ...data.results]);
      });
  }

  return (
    <div className={styles.homeContainer}>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <Header />

      <div className={`${styles.posts} ${commonStyles.container}`}>
        {posts.map(post => {
          return (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div className={commonStyles.info}>
                  <span>
                    <FiCalendar /> {format(post.first_publication_date)}
                  </span>
                  <span>
                    <FiUser /> {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          );
        })}

        {nextPage && (
          <button type="button" onClick={handlePagination}>
            Carregar mais posts
          </button>
        )}

        {preview && <ExitPreview />}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false, previewData }) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
      ref: previewData?.ref ?? null
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date ?? formatISO(new Date()),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
      preview
    },
    revalidate: 24 * 60 * 60, // 24 horas
  };
};
