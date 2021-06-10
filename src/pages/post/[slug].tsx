import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from '../../utils/formatDate';

import Header from '../../components/Header';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { Comments } from '../../components/Comments';
import { formatISO } from 'date-fns';
import { ExitPreview } from '../../components/ExitPreview';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean,
  nextPage: {
    slug: string,
    title: string
  } | null,
  previousPage: {
    slug: string,
    title: string
  } | null
}

export default function Post({ post, preview, nextPage, previousPage }: PostProps) {
  const router = useRouter();

  let estimatedReadingTime = '';

  if (post) {
    const content = post?.data.content;
    const totalWords = content?.reduce((acc, content) => {
      const heading = content.heading;
      const totalHeadingWords = heading.split(' ').length;

      const body = RichText.asText(content.body);
      const totalBodyWords = body.split(' ').length;

      acc += totalHeadingWords + totalBodyWords;

      return acc;
    }, 0);

    estimatedReadingTime = `${Math.ceil(totalWords / 200)} min`;
  }

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />

      <img src={post.data.banner.url} className={styles.banner} />

      <div className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>

          <div className={commonStyles.info}>
            <span>
              <FiCalendar /> {format(post.first_publication_date)}
            </span>
            <span>
              <FiUser /> {post.data.author}
            </span>
            <span>
              <FiClock /> {estimatedReadingTime}
            </span>
          </div>

          <div className={`${styles.content}`}>
            {post.data.content.map(content => {
              return (
                <section key={content.heading}>
                  <h2>{content.heading}</h2>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </section>
              );
            })}
          </div>
        </article>
        <footer>
          <div className={styles.divider} />

          <nav className={styles.postNavigation}>
            <div>
              {previousPage && (
                <>
                  <Link href={`/post/${previousPage.slug}`}>
                    <a>{previousPage.title}</a>
                  </Link>
                  <span>Post anterior</span>
                </>
              )}
            </div>

            <div className={styles.nextPost}>
              {nextPage && (
                <>
                  <Link href={`/post/${nextPage.slug}`}>
                    <a>{nextPage.title}</a>
                  </Link>
                  <span>Próximo post</span>
                </>
              )}
            </div>
          </nav>

          <Comments />

          {preview && <ExitPreview />}
        </footer>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.uid'],
      pageSize: 1,
    }
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: context?.previewData?.ref ?? null,
    fetch: ["next_page"]
  });

  const previousPageResponse = await prismic.query(
    [
      Prismic.predicates.dateAfter(
        'document.first_publication_date',
        response.first_publication_date
      )
    ],
    {
      fetch: ['posts.title'],
      pageSize: 1
    }
  );

  let previousPage = null;
  if (previousPageResponse.results.length > 0) {
    previousPage = {
      slug: previousPageResponse.results[0].uid,
      title: previousPageResponse.results[0].data.title
    }
  }

  const nextPageResponse = await prismic.query(
    [
      Prismic.predicates.dateBefore(
        'document.first_publication_date',
        response.first_publication_date
      )
    ],
    {
      fetch: ['posts.title'],
      pageSize: 1
    }
  );

  let nextPage = null;
  if (nextPageResponse.results.length > 0) {
    nextPage = {
      slug: nextPageResponse.results[0].uid,
      title: nextPageResponse.results[0].data.title
    }
  }

  const content = response.data.content.map(content => {
    return {
      heading: content.heading,
      body: content.body,
    };
  });

  const post = {
    uid: response.uid,
    first_publication_date: response?.first_publication_date ?? formatISO(new Date()),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content,
    },
  };

  return {
    props: {
      post,
      preview: context?.preview ?? false,
      previousPage,
      nextPage
    },
    revalidate: 24 * 60 * 60, // 24 horas
  };
};
