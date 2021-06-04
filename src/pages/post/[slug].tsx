import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from '../../utils/formatDate';

import Header from '../../components/Header';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
}

export default function Post({ post }: PostProps) {
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

  return (
    <>
      <Head>
        <title>{post ? post.data.title : 'Post'} | spacetraveling</title>
      </Head>

      <Header />

      {post ? (
        <>
          <img src={post.data.banner.url} className={styles.banner} />

          <article className={`${styles.post} ${commonStyles.container}`}>
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
        </>
      ) : (
        <p className={commonStyles.container}>Carregando...</p>
      )}
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
  const response = await prismic.getByUID('posts', String(slug), {});

  const content = response.data.content.map(content => {
    return {
      heading: content.heading,
      body: content.body,
    };
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
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
    },
    revalidate: 24 * 60 * 60, // 24 horas
  };
};
