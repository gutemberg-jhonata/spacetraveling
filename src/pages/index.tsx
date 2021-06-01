import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  postsPagination: PostPagination;
}

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <Header />
      <div className={styles.posts}>
        <a href="/">
          <h1>Como utilizar Hooks</h1>
          <p>Pensando em sincronização em vez de ciclos de vida.</p>
          <div className={styles.info}>
            <span>
              <FiCalendar /> 15 Mar 2021
            </span>
            <span>
              <FiUser /> Joseph Oliveira
            </span>
          </div>
        </a>
        <a href="/">
          <h1>Criando um app CRA do zero</h1>
          <p>
            Tudo sobre como criar a sua primeira aplicação utilizando Create
            React App
          </p>
          <div className={styles.info}>
            <span>
              <FiCalendar /> 19 Abr 2021
            </span>
            <span>
              <FiUser /> Danilo Vieira
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
