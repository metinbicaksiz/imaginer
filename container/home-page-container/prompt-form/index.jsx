'use client';
import styles from './styles.module.scss';
import { useHomepage } from '../use-homepage';

function PromptForm() {
  const { isSubmitting, generateImage, prompt, setPrompt } = useHomepage();

  const handleSubmit = (event) => {
    event.preventDefault();
    generateImage();
  };

  const handleChange = (event) => {
    setPrompt(event.target.value);
  };

  return (
    <div className={styles.promptForm}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          className={styles.promptTextarea}
          rows={2}
          type='text'
          placeholder='Both Angel and Evil are inside us. It is up to us which one to let out!'
          required
          value={prompt}
          onChange={handleChange}
        />
        <button
          className={styles.generateButton}
          type='submit'
          disabled={isSubmitting}
        >
          Generate
        </button>
      </form>
    </div>
  );
}

export { PromptForm };
