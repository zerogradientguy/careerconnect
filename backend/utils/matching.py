from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
import os

# Path to the Word2Vec model
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'w2vmodel', 'job_word2vec_large.model')

def load_model():
    """Initialize the text matching model"""
    return TfidfVectorizer(
        stop_words='english',
        max_features=10000,
        ngram_range=(1, 2)  # Include both single words and word pairs
    )

def preprocess_text(text):
    """Clean and tokenize text"""
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters but keep spaces
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    return text

def get_document_vector(model, document):
    """Convert document to vector by averaging word vectors"""
    tokens = preprocess_text(document)
    
    # Filter tokens that are in the model's vocabulary
    tokens = [token for token in tokens if token in model.wv]
    
    if not tokens:
        return None
    
    # Get the word vectors for each token
    word_vectors = [model.wv[token] for token in tokens]
    
    # Return the average of the word vectors
    return np.mean(word_vectors, axis=0)

def extract_skills_from_job(model, job_description):
    """Extract skills from job description using the Word2Vec model"""
    # This is a placeholder - in a real implementation, you'd use the model to
    # identify skills in the description or query a skills database
    job_vector = get_document_vector(model, job_description)
    
    if job_vector is None:
        return []
    
    # Get most similar words to the job description
    # These would be the skills most relevant to the job
    similar_words = model.wv.most_similar(positive=[job_vector], topn=20)
    
    # Return the skill words
    return [word for word, _ in similar_words]

def calculate_match_score(vectorizer, skills, job_description):
    """
    Calculate match score between skills and job description using TF-IDF and cosine similarity
    """
    if not skills or not job_description:
        return 0.0
    
    # Preprocess the texts
    skills_text = preprocess_text(' '.join(skills))
    job_text = preprocess_text(job_description)
    
    # Create TF-IDF vectors
    try:
        # Fit and transform the texts
        vectors = vectorizer.fit_transform([skills_text, job_text])
        
        # Calculate cosine similarity
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        
        # Convert to percentage and add some adjustments
        score = float(similarity) * 100
        
        # Add bonus for exact skill matches
        skill_matches = sum(1 for skill in skills if skill.lower() in job_text.lower())
        if skill_matches > 0:
            score += (skill_matches / len(skills)) * 20  # Add up to 20% bonus for exact matches
        
        # Ensure score is between 0 and 100
        score = min(100, max(0, score))
        
        return round(score, 1)
    except Exception as e:
        print(f"Error calculating match score: {e}")
        return 0.0

def calculate_seeker_to_jobs_scores(vectorizer, skills, job_descriptions):
    """
    Calculate match scores between skills and multiple job descriptions
    """
    if not skills or not job_descriptions:
        return []
    
    # Preprocess the texts
    skills_text = preprocess_text(' '.join(skills))
    job_texts = [preprocess_text(desc) for desc in job_descriptions]
    
    # Create TF-IDF vectors
    try:
        # Fit and transform the texts
        texts = [skills_text] + job_texts
        vectors = vectorizer.fit_transform(texts)
        
        # Calculate cosine similarities
        similarities = cosine_similarity(vectors[0:1], vectors[1:])[0]
        
        # Convert to percentages and add adjustments
        scores = []
        for i, similarity in enumerate(similarities):
            score = float(similarity) * 100
            
            # Add bonus for exact skill matches
            skill_matches = sum(1 for skill in skills if skill.lower() in job_texts[i].lower())
            if skill_matches > 0:
                score += (skill_matches / len(skills)) * 20  # Add up to 20% bonus for exact matches
            
            # Ensure score is between 0 and 100
            score = min(100, max(0, score))
            scores.append(round(score, 1))
        
        return scores
    except Exception as e:
        print(f"Error calculating job scores: {e}")
        return [0.0] * len(job_descriptions)

def calculate_job_to_seekers_scores(model, job_description, job_seekers):
    """
    Calculate match scores between a job and multiple job seekers
    
    Parameters:
    - model: Word2Vec model
    - job_description: Job description text
    - job_seekers: List of job seeker objects with skills
    
    Returns:
    - List of (job_seeker, score) tuples sorted by score
    """
    seeker_scores = []
    
    for seeker in job_seekers:
        # Get skills for this seeker
        skills = [skill.name for skill in seeker.skills]
        
        score = calculate_match_score(model, skills, job_description)
        seeker_scores.append((seeker, score))
    
    # Sort by score (highest first)
    seeker_scores.sort(key=lambda x: x[1], reverse=True)
    
    return seeker_scores

