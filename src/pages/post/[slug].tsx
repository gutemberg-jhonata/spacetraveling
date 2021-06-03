import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from '../../utils/formatDate';

import Header from '../../components/Header';

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
  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />

      <img src={post.data.banner.url} className={styles.banner} />

      <div className={`${styles.post} ${commonStyles.container}`}>
        <h1>{post.data.title}</h1>

        <div className={commonStyles.info}>
          <span>
            <FiCalendar /> {format(post.first_publication_date)}
          </span>
          <span>
            <FiUser /> {post.data.author}
          </span>
          <span>
            <FiClock /> {post.data.author}
          </span>
        </div>

        <div className={`${styles.content}`}>
          {post.data.content.map(content => {
            return (
              <section key={content.heading}>
                <h2>{content.heading}</h2>
                {content.body.map(body => (
                  <p key={body.text}>{body.text}</p>
                ))}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  //   const prismic = getPrismicClient();
  //   const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', slug.toString(), {});

  const content = response.data.content.map(content => {
    return {
      heading: content.heading,
      body: content.body.map(body => {
        return {
          text: body.text,
        };
      }),
    };
  });

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: response.data.banner,
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
