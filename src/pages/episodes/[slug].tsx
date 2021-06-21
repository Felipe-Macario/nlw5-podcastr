import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { api } from '../../services/api';
import conversion from '../../utils/conversion';
import { usePlayerContext } from '../../contexts/PlayerContext';

import styles from './episode.module.scss';

interface Episode {
    id: string;
    title: string;
    members: string;
    publishedAt: string;
    thumbnail: string;
    description: string;
    url: string;
    duration: number;
    durationAsString: string;
}

interface EpisodeProps {
    episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
    const { play } = usePlayerContext();

    return (
        <div className={styles.episode}>
            <Head>
                <title>{episode.title} | Podcastr</title>
            </Head>

            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Voltar"/>
                    </button>
                </Link>
                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    objectFit="cover"
                />
                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Tocar Episódio"/>
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div 
                className={styles.description} 
                dangerouslySetInnerHTML={{ __html: episode.description }} 
            />
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async(context) => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async(context) => {
    const { slug } = context.params;

    const { data } = await api.get(`/episodes/${slug}`);

    const episode = {
        id: data.id,
        title: data.title,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
        thumbnail: data.thumbnail,
        description: data.description,
        url: data.file.url,
        duration: Number(data.file.duration),
        durationAsString: conversion(Number(data.file.duration))  
    }

    return {
        props: {episode},
        revalidate: 60 * 60 * 24
    }
}