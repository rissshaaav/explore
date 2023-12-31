"use client";
import { useState } from "react";
import { useEffect } from "react";
import styles from "./write.module.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import dynamic from 'next/dynamic';
// import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "@/utils/firebase";

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false // Disable server-side rendering for ReactQuill
});

const Write = () => {
  const { data, status } = useSession();
  const [file, setFile] = useState(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [media, setMedia] = useState("");

  useEffect(() => {
    const storage = getStorage(app);
    const upload = () => {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, name);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {},
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setMedia(downloadURL);
          });
        }
      );
    };

    file && upload();
  }, [file]);

  if (status === "loading")
    return <div className={styles.loading}>Loading...</div>;
  if (status === "unauthenticated") router.push("/");

  const slugify = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleSubmit = async () => {
    const res = await fetch("/api/posts", {
      method: "POST",
      body: JSON.stringify({
        title,
        desc: value,
        img: media,
        slug: slugify(title),
        catSlug: catSlug || "style", //If not selected, choose the style category
      }),
    });

    if (res.status === 200) {
      const data = await res.json();
      console.log(data);
      router.push(`/posts/${data?.slug}`);
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Title"
        className={styles.input}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select
        className={styles.select}
        onChange={(e) => setCatSlug(e.target.value)}
      >
        <option value="style">style</option>
        <option value="fashion">fashion</option>
        <option value="food">food</option>
        <option value="culture">culture</option>
        <option value="travel">travel</option>
        <option value="coding">coding</option>
      </select>
      <div className={styles.editor}>
        <button className={styles.button} onClick={() => setOpen(!open)}>
          <Image src="/plus.png" alt="" width={16} height={16} />
        </button>
        {open && (
          <div className={styles.add}>
            <input
              type="file"
              id="image1"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button className={styles.addButton}>
              <label htmlFor="image1">
                <Image src="/image.png" alt="Image" width={16} height={16} />
              </label>
            </button>
            <button className={styles.addButton}>
              <Image src="/external.png" alt="File" width={16} height={16} />
            </button>
            <button className={styles.addButton}>
              <Image src="/video.png" alt="Video" width={16} height={16} />
            </button>
          </div>
        )}
        {/* Conditionally render ReactQuill */}
        {typeof document !== 'undefined' && ReactQuill && (
          <ReactQuill
            className={styles.textArea}
            readOnly={false}
            theme="bubble"
            value={value}
            onChange={setValue}
            placeholder="Tell Your Story..."
          />
        )}
      </div>
      <button className={styles.publish} onClick={handleSubmit}>
        Publish
      </button>
    </div>
  );
};

export default Write;
