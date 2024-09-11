export default function Home() {
  return (
    <div className="mt-8 flex flex-grow flex-col items-center justify-end">
      <footer className="flex flex-col gap-4 text-xs text-gray-500">
        <p>
          None of the content on this website is my own. All essays are written by Paul Graham and are reproduced here for educational and informational
          purposes. This site is intended to make his essays more accessible to a wider audience by offering translations into multiple languages. I do not
          claim any ownership or rights over the original works.
        </p>
        <p>
          For the official source of these brilliant essays, please visit{" "}
          <a className="text-sky-700" href="https://paulgraham.com" target="_blank">
            paulgraham.com
          </a>
          .
        </p>
      </footer>
    </div>
  )
}
