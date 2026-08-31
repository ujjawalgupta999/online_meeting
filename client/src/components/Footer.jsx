const Footer = () => {
  return (
    <footer className="mt-auto py-6 border-t border-slate-200 bg-white">
      <p className="text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Meetup Video Conferencing. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer