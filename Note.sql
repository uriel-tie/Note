--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: administrateur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administrateur (
    id_admin integer NOT NULL,
    nom character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    mot_de_passe character varying(255) NOT NULL
);


ALTER TABLE public.administrateur OWNER TO postgres;

--
-- Name: administrateur_id_admin_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.administrateur_id_admin_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.administrateur_id_admin_seq OWNER TO postgres;

--
-- Name: administrateur_id_admin_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.administrateur_id_admin_seq OWNED BY public.administrateur.id_admin;


--
-- Name: classe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.classe (
    id_classe integer NOT NULL,
    nom character varying(100) NOT NULL,
    annee character varying(10) NOT NULL,
    id_filiere integer NOT NULL
);


ALTER TABLE public.classe OWNER TO postgres;

--
-- Name: classe_id_classe_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.classe_id_classe_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.classe_id_classe_seq OWNER TO postgres;

--
-- Name: classe_id_classe_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.classe_id_classe_seq OWNED BY public.classe.id_classe;


--
-- Name: etudiant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.etudiant (
    id_etudiant integer NOT NULL,
    nom character varying(100) NOT NULL,
    mot_de_passe character varying(255) NOT NULL,
    id_classe integer,
    id_filiere integer
);


ALTER TABLE public.etudiant OWNER TO postgres;

--
-- Name: etudiant_id_etudiant_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.etudiant_id_etudiant_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.etudiant_id_etudiant_seq OWNER TO postgres;

--
-- Name: etudiant_id_etudiant_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.etudiant_id_etudiant_seq OWNED BY public.etudiant.id_etudiant;


--
-- Name: filiere; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.filiere (
    id_filiere integer NOT NULL,
    nom character varying(100) NOT NULL
);


ALTER TABLE public.filiere OWNER TO postgres;

--
-- Name: filiere_annee_ue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.filiere_annee_ue (
    id_filiere integer NOT NULL,
    annee character varying(10) NOT NULL,
    id_ue integer NOT NULL
);


ALTER TABLE public.filiere_annee_ue OWNER TO postgres;

--
-- Name: filiere_id_filiere_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.filiere_id_filiere_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.filiere_id_filiere_seq OWNER TO postgres;

--
-- Name: filiere_id_filiere_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.filiere_id_filiere_seq OWNED BY public.filiere.id_filiere;


--
-- Name: note; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.note (
    id_note integer NOT NULL,
    id_etudiant integer NOT NULL,
    id_ue integer NOT NULL,
    valeur numeric(5,2) NOT NULL,
    coefficient integer NOT NULL,
    ordre integer NOT NULL,
    CONSTRAINT note_coefficient_check CHECK ((coefficient > 0)),
    CONSTRAINT note_ordre_check CHECK ((ordre > 0)),
    CONSTRAINT note_valeur_check CHECK (((valeur >= (0)::numeric) AND (valeur <= (20)::numeric)))
);


ALTER TABLE public.note OWNER TO postgres;

--
-- Name: note_id_note_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.note_id_note_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.note_id_note_seq OWNER TO postgres;

--
-- Name: note_id_note_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.note_id_note_seq OWNED BY public.note.id_note;


--
-- Name: prof_classe_ue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prof_classe_ue (
    id_professeur integer NOT NULL,
    id_classe integer NOT NULL,
    id_ue integer NOT NULL
);


ALTER TABLE public.prof_classe_ue OWNER TO postgres;

--
-- Name: professeur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.professeur (
    id_professeur integer NOT NULL,
    nom character varying(100) NOT NULL,
    email character varying(100),
    mot_de_passe character varying(255) NOT NULL
);


ALTER TABLE public.professeur OWNER TO postgres;

--
-- Name: professeur_id_professeur_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.professeur_id_professeur_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.professeur_id_professeur_seq OWNER TO postgres;

--
-- Name: professeur_id_professeur_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.professeur_id_professeur_seq OWNED BY public.professeur.id_professeur;


--
-- Name: professeur_ue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.professeur_ue (
    id_professeur integer NOT NULL,
    id_ue integer NOT NULL
);


ALTER TABLE public.professeur_ue OWNER TO postgres;

--
-- Name: reclamation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reclamation (
    id_reclamation integer NOT NULL,
    id_note integer NOT NULL,
    id_etudiant integer NOT NULL,
    message text NOT NULL,
    statut character varying(20) DEFAULT 'en attente'::character varying NOT NULL,
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reclamation_message_check CHECK ((length(message) <= 300))
);


ALTER TABLE public.reclamation OWNER TO postgres;

--
-- Name: reclamation_id_reclamation_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reclamation_id_reclamation_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reclamation_id_reclamation_seq OWNER TO postgres;

--
-- Name: reclamation_id_reclamation_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reclamation_id_reclamation_seq OWNED BY public.reclamation.id_reclamation;


--
-- Name: ue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ue (
    id_ue integer NOT NULL,
    nom character varying(100) NOT NULL
);


ALTER TABLE public.ue OWNER TO postgres;

--
-- Name: ue_id_ue_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ue_id_ue_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ue_id_ue_seq OWNER TO postgres;

--
-- Name: ue_id_ue_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ue_id_ue_seq OWNED BY public.ue.id_ue;


--
-- Name: administrateur id_admin; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrateur ALTER COLUMN id_admin SET DEFAULT nextval('public.administrateur_id_admin_seq'::regclass);


--
-- Name: classe id_classe; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classe ALTER COLUMN id_classe SET DEFAULT nextval('public.classe_id_classe_seq'::regclass);


--
-- Name: etudiant id_etudiant; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etudiant ALTER COLUMN id_etudiant SET DEFAULT nextval('public.etudiant_id_etudiant_seq'::regclass);


--
-- Name: filiere id_filiere; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filiere ALTER COLUMN id_filiere SET DEFAULT nextval('public.filiere_id_filiere_seq'::regclass);


--
-- Name: note id_note; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note ALTER COLUMN id_note SET DEFAULT nextval('public.note_id_note_seq'::regclass);


--
-- Name: professeur id_professeur; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professeur ALTER COLUMN id_professeur SET DEFAULT nextval('public.professeur_id_professeur_seq'::regclass);


--
-- Name: reclamation id_reclamation; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamation ALTER COLUMN id_reclamation SET DEFAULT nextval('public.reclamation_id_reclamation_seq'::regclass);


--
-- Name: ue id_ue; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ue ALTER COLUMN id_ue SET DEFAULT nextval('public.ue_id_ue_seq'::regclass);


--
-- Name: administrateur administrateur_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrateur
    ADD CONSTRAINT administrateur_email_key UNIQUE (email);


--
-- Name: administrateur administrateur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrateur
    ADD CONSTRAINT administrateur_pkey PRIMARY KEY (id_admin);


--
-- Name: classe classe_annee_check; Type: CHECK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.classe
    ADD CONSTRAINT classe_annee_check CHECK (((annee)::text = ANY (ARRAY[('1'::character varying)::text, ('2'::character varying)::text, ('3'::character varying)::text]))) NOT VALID;


--
-- Name: classe classe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classe
    ADD CONSTRAINT classe_pkey PRIMARY KEY (id_classe);


--
-- Name: etudiant etudiant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etudiant
    ADD CONSTRAINT etudiant_pkey PRIMARY KEY (id_etudiant);


--
-- Name: filiere_annee_ue filiere_annee_ue_annee_check; Type: CHECK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.filiere_annee_ue
    ADD CONSTRAINT filiere_annee_ue_annee_check CHECK (((annee)::text = ANY (ARRAY[('1'::character varying)::text, ('2'::character varying)::text, ('3'::character varying)::text]))) NOT VALID;


--
-- Name: filiere_annee_ue filiere_annee_ue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filiere_annee_ue
    ADD CONSTRAINT filiere_annee_ue_pkey PRIMARY KEY (id_filiere, annee, id_ue);


--
-- Name: filiere filiere_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filiere
    ADD CONSTRAINT filiere_nom_key UNIQUE (nom);


--
-- Name: filiere filiere_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filiere
    ADD CONSTRAINT filiere_pkey PRIMARY KEY (id_filiere);


--
-- Name: note note_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT note_pkey PRIMARY KEY (id_note);


--
-- Name: prof_classe_ue prof_classe_ue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prof_classe_ue
    ADD CONSTRAINT prof_classe_ue_pkey PRIMARY KEY (id_professeur, id_classe, id_ue);


--
-- Name: professeur professeur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professeur
    ADD CONSTRAINT professeur_pkey PRIMARY KEY (id_professeur);


--
-- Name: professeur_ue professeur_ue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professeur_ue
    ADD CONSTRAINT professeur_ue_pkey PRIMARY KEY (id_professeur, id_ue);


--
-- Name: reclamation reclamation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamation
    ADD CONSTRAINT reclamation_pkey PRIMARY KEY (id_reclamation);


--
-- Name: ue ue_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ue
    ADD CONSTRAINT ue_nom_key UNIQUE (nom);


--
-- Name: ue ue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ue
    ADD CONSTRAINT ue_pkey PRIMARY KEY (id_ue);


--
-- Name: classe classe_id_filiere_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classe
    ADD CONSTRAINT classe_id_filiere_fkey FOREIGN KEY (id_filiere) REFERENCES public.filiere(id_filiere) ON DELETE CASCADE;


--
-- Name: filiere_annee_ue filiere_annee_ue_id_filiere_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filiere_annee_ue
    ADD CONSTRAINT filiere_annee_ue_id_filiere_fkey FOREIGN KEY (id_filiere) REFERENCES public.filiere(id_filiere) ON DELETE CASCADE;


--
-- Name: filiere_annee_ue filiere_annee_ue_id_ue_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filiere_annee_ue
    ADD CONSTRAINT filiere_annee_ue_id_ue_fkey FOREIGN KEY (id_ue) REFERENCES public.ue(id_ue) ON DELETE CASCADE;


--
-- Name: etudiant fk_classe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etudiant
    ADD CONSTRAINT fk_classe FOREIGN KEY (id_classe) REFERENCES public.classe(id_classe) ON DELETE CASCADE;


--
-- Name: etudiant fk_filiere; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etudiant
    ADD CONSTRAINT fk_filiere FOREIGN KEY (id_filiere) REFERENCES public.filiere(id_filiere) ON DELETE CASCADE;


--
-- Name: note note_id_etudiant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT note_id_etudiant_fkey FOREIGN KEY (id_etudiant) REFERENCES public.etudiant(id_etudiant) ON DELETE CASCADE;


--
-- Name: note note_id_ue_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT note_id_ue_fkey FOREIGN KEY (id_ue) REFERENCES public.ue(id_ue) ON DELETE CASCADE;


--
-- Name: prof_classe_ue prof_classe_ue_id_classe_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prof_classe_ue
    ADD CONSTRAINT prof_classe_ue_id_classe_fkey FOREIGN KEY (id_classe) REFERENCES public.classe(id_classe);


--
-- Name: prof_classe_ue prof_classe_ue_id_professeur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prof_classe_ue
    ADD CONSTRAINT prof_classe_ue_id_professeur_fkey FOREIGN KEY (id_professeur) REFERENCES public.professeur(id_professeur);


--
-- Name: prof_classe_ue prof_classe_ue_id_ue_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prof_classe_ue
    ADD CONSTRAINT prof_classe_ue_id_ue_fkey FOREIGN KEY (id_ue) REFERENCES public.ue(id_ue);


--
-- Name: professeur_ue professeur_ue_id_professeur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professeur_ue
    ADD CONSTRAINT professeur_ue_id_professeur_fkey FOREIGN KEY (id_professeur) REFERENCES public.professeur(id_professeur) ON DELETE CASCADE;


--
-- Name: professeur_ue professeur_ue_id_ue_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professeur_ue
    ADD CONSTRAINT professeur_ue_id_ue_fkey FOREIGN KEY (id_ue) REFERENCES public.ue(id_ue) ON DELETE CASCADE;


--
-- Name: reclamation reclamation_id_etudiant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamation
    ADD CONSTRAINT reclamation_id_etudiant_fkey FOREIGN KEY (id_etudiant) REFERENCES public.etudiant(id_etudiant) ON DELETE CASCADE;


--
-- Name: reclamation reclamation_id_note_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamation
    ADD CONSTRAINT reclamation_id_note_fkey FOREIGN KEY (id_note) REFERENCES public.note(id_note) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

